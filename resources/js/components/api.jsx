const api = axios.create({
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
        "X-requested-With": "XMLHttpRequest",
    }
})


api.interceptors.request.use((config) => {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content")

    if (token) {
        config.headers["X-CSRF-TOKEN"] = token
    }

    return config
})

export default api