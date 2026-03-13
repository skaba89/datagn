async function login() {
    // 1. Get CSRF Token
    const csrfRes = await fetch("http://localhost:3002/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();
    const cookies = csrfRes.headers.get("set-cookie");

    console.log("CSRF Token:", csrfToken);

    // 2. Post credentials
    const loginRes = await fetch("http://localhost:3002/api/auth/callback/credentials", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": cookies || ""
        },
        body: new URLSearchParams({
            csrfToken,
            email: "test@datagn.local",
            password: "password123",
            redirect: "false"
        })
    });

    const result = await loginRes.json();
    console.log("Login Result:", result);
}
login();
