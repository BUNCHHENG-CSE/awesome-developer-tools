async function runMiddlewareTests() {
  console.log("🧪 Testing Next.js Middleware route protection for /admin...\n");

  const baseUrl = "http://localhost:3000";

  // TEST 1: Direct unauthenticated request to /admin
  console.log("Test 1: Direct route to /admin without login (redirect: 'manual')");
  const unauthAdminRes = await fetch(`${baseUrl}/admin`, {
    redirect: "manual",
  });
  console.log(`Status: ${unauthAdminRes.status}`);
  const locationHeader = unauthAdminRes.headers.get("location");
  console.log(`Location redirect header: ${locationHeader}`);

  const isRedirectToLogin =
    (unauthAdminRes.status === 307 || unauthAdminRes.status === 308 || unauthAdminRes.status === 302) &&
    locationHeader &&
    locationHeader.includes("/login?redirect=");

  if (!isRedirectToLogin) {
    throw new Error(
      `Middleware failed to redirect unauthenticated request! Status: ${unauthAdminRes.status}, Location: ${locationHeader}`
    );
  }
  console.log("✅ Test 1 PASSED: Unauthenticated user attempting to route to /admin is immediately redirected to /login by middleware!\n");

  // TEST 2: Direct unauthenticated request to /my-submissions
  console.log("Test 2: Direct route to /my-submissions without login");
  const unauthMySubsRes = await fetch(`${baseUrl}/my-submissions`, {
    redirect: "manual",
  });
  console.log(`Status: ${unauthMySubsRes.status}, Location: ${unauthMySubsRes.headers.get("location")}`);
  if (!unauthMySubsRes.headers.get("location")?.includes("/login?redirect=")) {
    throw new Error("Middleware failed to protect /my-submissions");
  }
  console.log("✅ Test 2 PASSED: Direct route to /my-submissions is intercepted by middleware!\n");

  // TEST 3: Normal user (Tool Submitter) attempting to access /admin
  console.log("Test 3: Normal user (Tool Submitter) attempting to route to /admin");
  const userLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "user@devatlas.com", password: "user123" }),
  });
  const userCookie = userLogin.headers.get("set-cookie") || "";

  const normalUserAdminRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: userCookie },
    redirect: "manual",
  });
  console.log(`Status: ${normalUserAdminRes.status}, Location: ${normalUserAdminRes.headers.get("location")}`);
  if (!normalUserAdminRes.headers.get("location")?.includes("admin_required")) {
    throw new Error("Middleware failed to block non-admin from /admin");
  }
  console.log("✅ Test 3 PASSED: Non-admin user is blocked from /admin by middleware!\n");

  // TEST 4: Admin user accessing /admin
  console.log("Test 4: Admin user accessing /admin");
  const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@devatlas.com", password: "admin123" }),
  });
  const adminCookie = adminLogin.headers.get("set-cookie") || "";

  const adminRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: adminCookie },
    redirect: "manual",
  });
  console.log(`Status: ${adminRes.status}`);
  if (adminRes.status !== 200) {
    throw new Error(`Admin failed to access /admin, status: ${adminRes.status}`);
  }
  console.log("✅ Test 4 PASSED: Admin with valid credentials passes middleware into /admin with HTTP 200!\n");

  console.log("🎉 ALL MIDDLEWARE ROUTE PROTECTION TESTS PASSED SUCCESSFULLY!");
}

runMiddlewareTests().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
