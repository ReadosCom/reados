const [, , targetUrl] = process.argv;
const timeoutMs = 60_000;
const retryDelayMs = 500;

if (!targetUrl) {
  throw new Error(`Usage: tsx e2e/testing/wait-for-url.ts <url>`);
}

const waitForUrl = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(targetUrl);

      if (response.ok) {
        console.log(`Successfully reached ${targetUrl}`);
        return;
      }
    } catch {
      // The Compose stack may still be starting.
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }

  throw new Error(`Timed out waiting for ${targetUrl}`);
};

await waitForUrl();
