async function runAdminCrudTests() {
  console.log("🧪 Starting Admin Role & CRUD verification tests...\n");

  const baseUrl = "http://localhost:3000";

  // 1. Login as Admin
  console.log("Step 1: Authenticate as Admin");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@devatlas.com", password: "admin123" }),
  });
  const adminCookies = loginRes.headers.get("set-cookie") || "";
  if (loginRes.status !== 200) throw new Error("Admin login failed");
  console.log("✅ Admin logged in.\n");

  // 2. CREATE (User with Admin role)
  console.log("Step 2: Admin creates a new user with 'admin' role (POST /api/admin/users)");
  const createRes = await fetch(`${baseUrl}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      name: "Second Admin",
      email: "admin2@devatlas.com",
      password: "admin2password123",
      role: "admin",
    }),
  });
  console.log(`Create Status: ${createRes.status}`);
  const createJson = await createRes.json();
  console.log(`Created user: ${createJson.data?.email}, Role: ${createJson.data?.role}`);
  if (createRes.status !== 201 || createJson.data?.role !== "admin") {
    throw new Error("Failed to create admin user");
  }
  const createdUserId = createJson.data.id;
  console.log("✅ CREATE user with Admin role succeeded.\n");

  // 3. READ (List & filter users)
  console.log("Step 3: Admin reads users list filtered by role 'admin' (GET /api/admin/users?role=admin)");
  const readRes = await fetch(`${baseUrl}/api/admin/users?role=admin`, {
    headers: { Cookie: adminCookies },
  });
  const readJson = await readRes.json();
  const hasSecondAdmin = readJson.data?.some((u: any) => u.id === createdUserId);
  console.log(`Found newly created admin in list: ${hasSecondAdmin}`);
  if (!hasSecondAdmin) throw new Error("Created user not found in admin list");
  console.log("✅ READ users list succeeded.\n");

  // 4. UPDATE (Change role from admin to user / edit name)
  console.log("Step 4: Admin updates user (demotes role to 'user' and edits name)");
  const updateRes = await fetch(`${baseUrl}/api/admin/users/${createdUserId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      name: "Demoted to Submitter",
      role: "user",
    }),
  });
  const updateJson = await updateRes.json();
  console.log(`Updated user: ${updateJson.data?.name}, New role: ${updateJson.data?.role}`);
  if (updateRes.status !== 200 || updateJson.data?.role !== "user") {
    throw new Error("Failed to update user role");
  }
  console.log("✅ UPDATE user & role succeeded.\n");

  // 5. DELETE (Delete the created user)
  console.log("Step 5: Admin deletes user (DELETE /api/admin/users/[id])");
  const deleteRes = await fetch(`${baseUrl}/api/admin/users/${createdUserId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookies },
  });
  const deleteJson = await deleteRes.json();
  console.log(`Delete status: ${deleteRes.status}, success: ${deleteJson.data?.success}`);
  if (deleteRes.status !== 200 || !deleteJson.data?.success) {
    throw new Error("Failed to delete user");
  }
  console.log("✅ DELETE user succeeded.\n");

  console.log("🎉 ALL ADMIN ROLE CRUD TESTS PASSED SUCCESSFULLY!");
}

runAdminCrudTests().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
