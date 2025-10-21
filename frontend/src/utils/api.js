import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// User APIs
export const loginUser = (credentials) => api.post('/users/login', credentials)
export const createUser = (userData) => api.post('/users', userData)
export const getUser = (id) => api.get(`/users/${id}`)

// Playlist APIs
export const getPlaylists = (userId) => api.get(`/playlists/user/${userId}`)
export const getPlaylist = (id) => api.get(`/playlists/${id}`)
export const createPlaylist = (data) => api.post('/playlists', data)
export const updatePlaylist = (id, data) => api.put(`/playlists/${id}`, data)
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`)
export const previewPlaylist = (playlistUrl) => api.post('/playlists/preview', { playlistUrl })
export const importPlaylist = (data) => api.post('/playlists/import', data)

// Video APIs
export const getVideosByPlaylist = (playlistId) => api.get(`/videos/playlist/${playlistId}`)
export const getVideo = (id) => api.get(`/videos/${id}`)
export const addVideo = (data) => api.post('/videos', data)
export const updateVideoStatus = (id, status) => api.patch(`/videos/${id}/status`, { status })
export const deleteVideo = (id) => api.delete(`/videos/${id}`)

// Note APIs
export const getNotesByVideo = (videoId) => api.get(`/notes/video/${videoId}`)
export const createNote = (data) => api.post('/notes', data)
export const updateNote = (id, data) => api.put(`/notes/${id}`, data)
export const deleteNote = (id) => api.delete(`/notes/${id}`)

// Achievement APIs
export const createAchievement = (data) => api.post('/achievements', data)
export const getUserAchievements = (userId) => api.get(`/achievements/user/${userId}`)
export const getPlaylistProgress = (playlistId) => api.get(`/achievements/playlist/${playlistId}/progress`)

// Progress APIs
export const getProgressStats = (userId) => api.get(`/progress/user/${userId}`)

export default api
