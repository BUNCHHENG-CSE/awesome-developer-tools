async function runTests() {
  console.log("🧪 Starting automated verification test suite on http://localhost:3000...\n");

  const baseUrl = "http://localhost:3000";

  // TEST 1: Unauthenticated Tool Submission
  console.log("Test 1: Unauthenticated POST /api/submissions (should fail with 401)");
  const unauthRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Unauth Tool",
      websiteUrl: "https://test-unauth.dev",
    }),
  });
  console.log(`Status: ${unauthRes.status}`);
  const unauthJson = await unauthRes.json();
  console.log(`Error message: ${unauthJson.error}`);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401, got ${unauthRes.status}`);
  }
  console.log("✅ Test 1 PASSED: Unauthenticated users CANNOT submit tools.\n");

  // TEST 2: Normal User Login
  console.log("Test 2: Normal user login (user@devatlas.com)");
  const userLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user@devatlas.com",
      password: "user123",
    }),
  });
  const userCookies = userLoginRes.headers.get("set-cookie") || "";
  const userJson = await userLoginRes.json();
  console.log(`Status: ${userLoginRes.status}, User role: ${userJson.data?.user?.role}`);
  if (userLoginRes.status !== 200 || userJson.data?.user?.role !== "user") {
    throw new Error("Normal user login failed or role mismatch");
  }
  console.log("✅ Test 2 PASSED: Normal user (Tool Submitter) logged in successfully.\n");

  // TEST 3: Authenticated Normal User Submitting a Tool
  console.log("Test 3: Authenticated Tool Submitter submits a tool");
  const subRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: userCookies,
    },
    body: JSON.stringify({
      name: "AutoTest Tool",
      websiteUrl: "https://autotest-tool.dev",
    }),
  });
  console.log(`Status: ${subRes.status}`);
  const subJson = await subRes.json();
  console.log(`Submission ID: ${subJson.data?.id}, Status: ${subJson.data?.status}, UserID: ${subJson.data?.userId}`);
  if (subRes.status !== 201 || subJson.data?.status !== "pending") {
    throw new Error("Tool submission by authenticated user failed");
  }
  const submissionId = subJson.data.id;
  console.log("✅ Test 3 PASSED: Authenticated user successfully submitted a tool.\n");

  // TEST 4: Normal User Accessing Admin API
  console.log("Test 4: Normal user attempting to access /api/admin/stats (should return 403 Forbidden)");
  const forbiddenRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: userCookies },
  });
  console.log(`Status: ${forbiddenRes.status}`);
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected 403, got ${forbiddenRes.status}`);
  }
  console.log("✅ Test 4 PASSED: Normal user is strictly forbidden from admin API.\n");

  // TEST 5: Admin Login
  console.log("Test 5: Admin user login (admin@devatlas.com)");
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@devatlas.com",
      password: "admin123",
    }),
  });
  const adminCookies = adminLoginRes.headers.get("set-cookie") || "";
  const adminJson = await adminLoginRes.json();
  console.log(`Status: ${adminLoginRes.status}, Role: ${adminJson.data?.user?.role}`);
  if (adminLoginRes.status !== 200 || adminJson.data?.user?.role !== "admin") {
    throw new Error("Admin login failed or role mismatch");
  }
  console.log("✅ Test 5 PASSED: Admin logged in successfully.\n");

  // TEST 6: Admin Accessing Stats & Submissions
  console.log("Test 6: Admin accessing /api/admin/stats and /api/admin/submissions");
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: adminCookies },
  });
  const statsJson = await statsRes.json();
  console.log(`Stats - Tools: ${statsJson.data?.totalTools}, Pending Submissions: ${statsJson.data?.submissions?.pending}, Users: ${statsJson.data?.totalUsers}`);
  if (statsRes.status !== 200) {
    throw new Error("Admin stats fetch failed");
  }

  const listRes = await fetch(`${baseUrl}/api/admin/submissions?status=pending`, {
    headers: { Cookie: adminCookies },
  });
  const listJson = await listRes.json();
  const found = listJson.data?.some((s: any) => s.id === submissionId);
  console.log(`Found submission in pending queue: ${found}`);
  if (!found) {
    throw new Error("Submission not found in admin queue");
  }
  console.log("✅ Test 6 PASSED: Admin retrieved statistics and pending submissions queue.\n");

  // TEST 7: Admin Approves Submission
  console.log("Test 7: Admin approves the submitted tool");
  const approveRes = await fetch(`${baseUrl}/api/admin/submissions/${submissionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({ action: "approve" }),
  });
  const approveJson = await approveRes.json();
  console.log(`Approved status: ${approveJson.data?.status}`);
  if (approveRes.status !== 200 || approveJson.data?.status !== "approved") {
    throw new Error("Admin approval failed");
  }
  console.log("✅ Test 7 PASSED: Submission approved by admin.\n");

  // TEST 8: Admin Deletes Test Submission (Cleanup)
  console.log("Test 8: Admin deletes test submission (cleanup)");
  const deleteRes = await fetch(`${baseUrl}/api/admin/submissions/${submissionId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookies },
  });
  console.log(`Delete status: ${deleteRes.status}`);
  if (deleteRes.status !== 200) {
    throw new Error("Admin delete failed");
  }
  console.log("✅ Test 8 PASSED: Test submission cleaned up.\n");

  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! Everything is working flawlessly.");
}

runTests().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
