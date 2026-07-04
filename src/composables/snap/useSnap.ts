export function useSnap() {
  function loadSnap(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.snap) return resolve() // already loaded

      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '')
      script.onload = () => resolve()
      script.onerror = (err) => reject(err)
      document.head.appendChild(script)
    })
  }

  async function pay(
    snapToken: string,
    options?: {
      onSuccess?: (result: unknown) => void
      onPending?: (result: unknown) => void
      onError?: (result: unknown) => void
      onClose?: () => void
    },
  ) {
    await loadSnap()
    window.snap.pay(snapToken, options)
  }

  return { pay }
}
