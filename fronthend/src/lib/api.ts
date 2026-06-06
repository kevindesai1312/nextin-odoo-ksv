export const api = {
  async get(url: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      const error: any = new Error(data.message || 'API Error');
      error.response = { data };
      throw error;
    }
    return { data };
  },
  
  async post(url: string, data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const resData = await response.json();
    if (!response.ok) {
      const error: any = new Error(resData.message || 'API Error');
      error.response = { data: resData };
      throw error;
    }
    return { data: resData };
  },

  async put(url: string, data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const resData = await response.json();
    if (!response.ok) {
      const error: any = new Error(resData.message || 'API Error');
      error.response = { data: resData };
      throw error;
    }
    return { data: resData };
  },

  async delete(url: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const resData = await response.json();
    if (!response.ok) {
      const error: any = new Error(resData.message || 'API Error');
      error.response = { data: resData };
      throw error;
    }
    return { data: resData };
  }
};
