<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <Sidebar @logout="logout" />

    <!-- MAIN CONTENT -->
    <div class="flex-grow-1">
      <!-- <Navbar /> -->

      <main class="p-4 bg-light min-vh-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Stream List</h5>
          <button class="btn btn-primary fw-bold" @click="showUploadModal">
            + Add Stream
          </button>
        </div>

        <div class="row g-3">
          <div
            class="col-md-4"
            v-for="(card, index) in streamCards"
            :key="index"
          >
            <div class="card shadow-sm border-0 rounded-3">
              <div
                class="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3"
              >
                <span v-if="card.isLive" class="badge bg-danger me-2"
                  >LIVE</span
                >
                <div class="d-flex align-items-center">
                  <span class="text-muted me-2">{{ index + 1 }} -</span>
                  <input
                    type="text"
                    v-model="card.title"
                    class="form-control form-control-sm border-0 fw-bold p-0"
                    style="width: 140px"
                  />
                </div>
              </div>
              <div class="card-body pt-2">
                <div
                  class="ratio ratio-16x9 bg-dark rounded overflow-hidden mb-3"
                >
                  <video
                    :src="card.videoUrl"
                    class="w-100 h-100 object-fit-cover"
                    muted
                    autoplay
                    playsinline
                    loop
                    controls
                  ></video>
                </div>
              </div>
              <div
                class="form-check form-switch d-flex justify-content-end mb-3"
              >
                <label class="form-check-label me-5 small text-muted">
                  Advanced
                </label>
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="card.advanced"
                />
              </div>

              <div class="input-group mb-3">
                <input
                  type="password"
                  class="form-control border-light-subtle bg-light"
                  placeholder="Stream Key"
                  v-model="card.streamKey"
                />
                <span
                  class="input-group-text bg-light border-light-subtle text-muted"
                >
                  <i class="bi bi-eye"></i>
                </span>
              </div>
              <input
                type="text"
                class="form-control border-light-subtle bg-light mb-3"
                v-model="card.rtmpUrl"
              />
              <div class="row g-2 mb-4">
                <div class="col-4">
                  <label class="x-small text-muted fw-bold mb-1">
                    Bitrate (kbps)
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="card.bitrate"
                  />
                </div>

                <div class="col-4">
                  <label class="x-small text-muted fw-bold mb-1"
                    >Resolusi</label
                  >
                  <select class="form-select" v-model="card.resolution">
                    <option value="1920x1080">1080p</option>
                    <option value="1280x720">720p</option>
                    <option value="854x480">480p</option>
                  </select>
                </div>

                <div class="col-4">
                  <label class="x-small text-muted fw-bold mb-1">FPS</label>
                  <select class="form-select" v-model="card.fps">
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                  </select>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button
                  v-if="!card.isLive"
                  class="btn btn-success flex-grow-1 fw-bold"
                  :disabled="card.isStarting"
                  @click="startLive(card)"
                >
                  {{ card.isStarting ? "Starting..." : "Start" }}
                </button>

                <button
                  v-else
                  class="btn btn-danger flex-grow-1 fw-bold"
                  @click="stopLive(card)"
                >
                  Stop
                </button>

                <button
                  class="btn btn-secondary fw-bold px-3"
                  @click="confirmDelete(card, index)"
                >
                  Hapus Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Toast :toast="toast" @hide="hideToast" />

  <div class="modal fade" id="uploadModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Video</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Pilih Video</label>
            <input
              type="file"
              class="form-control"
              accept="video/*"
              @change="onFileChange"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">
            Batal
          </button>
          <button
            class="btn btn-primary"
            :disabled="!selectedFile"
            @click="uploadVideo"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as bootstrap from "bootstrap"; // ← WAJIB
import Sidebar from "../components/Sidebar.vue";
import Toast from "../components/Toast.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VIDEO_BASE = import.meta.env.VITE_API_VIDEO_BASE;
// console.log("API_BASE_URL:", API_VIDEO_BASE);

const streamCards = ref([]);
const page = ref("dashboard");
const selectedFile = ref(null);
const deletingIndex = ref(null);

const showToast = (message, type = "primary", closable = true) => {
  toast.value = {
    show: true,
    message,
    type,
    closable,
  };
};

const toast = ref({
  show: false,
  message: "",
  type: "primary",
  closable: true,
});

// =======================
// LOAD VIDEO LIST
// =======================
const loadVideos = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("Token tidak ada, silakan login.");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/videos`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) throw new Error("Gagal fetch videos");

    const files = await res.json();

    streamCards.value = files.map((v, index) => ({
      title: v.title || `Video ${index + 1}`,
      file: v.file,
      videoUrl: `${API_VIDEO_BASE}/video/${v.file}`, // ← pakai base URL

      streamKey: v.stream_key || "",
      rtmpUrl: v.rtmp_url,
      advanced: !!v.advanced,
      bitrate: v.bitrate,
      resolution: v.resolution,
      fps: v.fps,

      isLive: false,
      livePid: null,
    }));

    // cek live status masing-masing video
    streamCards.value.forEach(checkLiveStatus);
  } catch (err) {
    console.error("Gagal load video:", err);
    this.showToast("Gagal load video", "danger", true);
  }
};

const checkLiveStatus = async (card) => {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `/api/live/status?file=${encodeURIComponent(card.file)}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (!res.ok) return;
    const data = await res.json();
    card.isLive = !!data.is_live;
    card.livePid = data.live_pid || null;
  } catch (err) {
    console.error("Gagal cek live:", card.file, err);
  }
};

// =======================
// HELPERS
// =======================

const showUploadModal = () => {
  const modalEl = document.getElementById("uploadModal");
  if (!modalEl) return;

  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

  modal.show();
};

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const uploadVideo = async () => {
  const modalEl = document.getElementById("uploadModal");
  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

  // tutup modal langsung
  modal.hide();

  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  showToast("Uploading video...", "primary", false);

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload gagal");

    await loadVideos();

    showToast("Upload selesai ✔", "success", true);
    selectedFile.value = null;
  } catch (err) {
    console.error("Upload gagal:", err);
    showToast("Upload gagal ❌", "danger", true);
  }
};

const confirmDelete = (card, index) => {
  const ok = confirm(`Yakin hapus video?\n\n${card.file}`);
  if (!ok) return;

  deleteVideo(card.file, index);
};

const deleteVideo = async (file, index) => {
  deletingIndex.value = index;
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/video/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ file }),
    });

    if (!res.ok) throw new Error("Delete gagal");

    streamCards.value.splice(index, 1);
    showToast("Video dihapus ✔", "success", true);
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Gagal menghapus video ❌", "danger", true);
  } finally {
    deletingIndex.value = null;
  }
};

const startLive = async (card) => {
  if (!card.streamKey || card.streamKey.trim() === "") {
    showToast("Stream Key wajib diisi ❗", "danger", true);
    return;
  }

  card.isStarting = true;

  try {
    const token = localStorage.getItem("access_token");

    const payload = {
      title: card.title,
      file: card.file,
      youtube_key: card.streamKey,
      rtmpUrl: card.rtmpUrl,
      advanced: card.advanced,
      bitrate: card.bitrate,
      resolution: card.resolution,
      fps: card.fps,
    };

    showToast("Memulai live...", "primary", false);

    const res = await fetch(`${API_BASE_URL}/live/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Gagal start live");

    card.isLive = true;

    localStorage.setItem(
      "live_state_" + card.file,
      JSON.stringify({ isLive: true })
    );

    showToast("LIVE dimulai ✔", "success", true);
  } catch (err) {
    console.error(err);
    showToast("Gagal memulai live ❌", "danger", true);
  } finally {
    card.isStarting = false;
  }
};

const stopLive = async (card) => {
  try {
    const token = localStorage.getItem("access_token");

    showToast("Menghentikan live...", "primary", false);

    const res = await fetch(`${API_BASE_URL}/live/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ file: card.file }),
    });

    if (!res.ok) throw new Error("Gagal stop live");

    card.isLive = false;

    // HAPUS STATE LIVE
    localStorage.removeItem("live_state_" + card.file);

    showToast("LIVE dihentikan ⛔", "success", true);
  } catch (err) {
    console.error(err);
    showToast("Gagal menghentikan live ❌", "danger", true);
  }
};

const logout = () => {
  localStorage.removeItem("access_token");
  window.location.href = "/login";
};

// Auto load videos saat component dimount
onMounted(() => {
  loadVideos();
});
</script>

<style scoped></style>
