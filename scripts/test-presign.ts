import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
    credentials: { accessKeyId: "minioadmin", secretAccessKey: "minioadmin" },
});

async function test() {
    const objectKey = `test/upload-test-${Date.now()}.csv`;
    const command = new PutObjectCommand({
        Bucket: "datagn",
        Key: objectKey,
        ContentType: "text/csv",
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log("✅ Presign URL generated!\n", url);
}

test().catch(console.error);
