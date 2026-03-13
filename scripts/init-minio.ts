import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
    },
});

async function initBucket() {
    const bucketName = process.env.S3_BUCKET || "datagn";

    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`✅ Bucket "${bucketName}" already exists.`);
    } catch (error: any) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            console.log(`🚀 Creating bucket "${bucketName}"...`);
            await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`✅ Bucket "${bucketName}" created successfully.`);
        } else {
            console.error("❌ Error checking/creating bucket:", error);
        }
    }
}

initBucket();
