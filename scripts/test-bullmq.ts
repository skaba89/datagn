import { Queue, QueueEvents } from "bullmq";

const connection = { host: "localhost", port: 6379 };

async function testQueue() {
    console.log("🚀 Testing BullMQ connection to Redis...");

    const testQueue = new Queue("datagn-test", { connection });

    // Ajouter un job de test
    const job = await testQueue.add("test-job", { message: "Hello from DataGN!" });
    console.log(`✅ Job added to queue! ID: ${job.id}`);

    const counts = await testQueue.getJobCounts("waiting", "completed");
    console.log(`📊 Queue state: ${JSON.stringify(counts)}`);

    // Nettoyer la file de test
    await testQueue.drain();
    await testQueue.close();

    console.log("✅ BullMQ + Redis connectivity test PASSED! ✅");
}

testQueue().catch(err => {
    console.error("❌ BullMQ test FAILED:", err.message);
    process.exit(1);
});
