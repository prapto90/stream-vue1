import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

// Mendaftarkan event handler untuk menangani permintaan 'fetch' (permintaan HTTP)
addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    // Logika Workers Site: Mencoba mengambil aset statis dari KV
    return await getAssetFromKV(event);
  } catch (e) {
    // Jika tidak ditemukan, kembalikan 404
    let pathname = new URL(event.request.url).pathname;
    return new Response(`"${pathname}" not found`, {
      status: 404,
    });
  }
}
