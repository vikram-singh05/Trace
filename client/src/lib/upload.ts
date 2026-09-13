const API_BASE = import.meta.env.VITE_API_BASE_URL;


export const uploadImage = async (file: File, folder = 'item-images'): Promise<string> => {

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPG, PNG, WEBP, and HEIC are allowed.`);
  }


  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
  }


  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Failed to upload image');
  }

  const data = await res.json();
  return data.url;
};
