const accounts = [
    {
        name: "Test User",
        email: "test@datagn.local",
        password: "password123",
        workspace: "Mon Workspace"
    },
    {
        name: "Demo Admin",
        email: "admin@datagn.local",
        password: "password123",
        workspace: "DataGN Demo"
    },
    {
        name: "Ousmane",
        email: "ousmane@datagn.local",
        password: "password123",
        workspace: "Conakry Analytics"
    }
];

async function createAccounts() {
    console.log("Creating test accounts...");
    for (const acc of accounts) {
        try {
            const res = await fetch("http://localhost:3002/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(acc)
            });
            const data = await res.json();
            if (res.ok) {
                console.log(`✅ Success creating: ${acc.email}`);
            } else {
                console.log(`❌ Failed creating ${acc.email}:`, data);
            }
        } catch (e) {
            console.log(`❌ Network Error for ${acc.email}:`, e.message);
        }
    }
}

createAccounts();
