async function test() {
    const res = await fetch("http://localhost:3002/api/test-bcrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            password: "password123",
            hash: "$2b$12$L0iUiNqI8kQbYCL1qDgp2OwKMkRfAzPbWVBOkPc8gBOfwoInF5SV."
        })
    });
    const data = await res.json();
    console.log(data);
}
test();
