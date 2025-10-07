export function toFormData(obj: any): FormData {
  const formData = new FormData();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString()); // 'true' o 'false'
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
  }

  return formData;
}
