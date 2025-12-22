const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  async fetchProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async fetchSubCategories(category) {
    const response = await fetch(`${API_BASE_URL}/products/get_sub_category_names/${category}`);
    if (!response.ok) throw new Error('Failed to fetch subcategories');
    console.log('Fetched subcategories:', await response.clone().json());
    return response.json();
  },

  async fetchProductsBySubCategory(category, subCategory) {
    const response = await fetch(`${API_BASE_URL}/products/category_wise/${category}/${subCategory}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    console.log('Fetched products by subcategory:', await response.clone().json()); 
    return response.json();
  },

  async fetchProductsInfiniteScroll(limit = 50, offset = 0) {
    const response = await fetch(`${API_BASE_URL}/products/get_all_products_infinite_scroll?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    console.log('Fetched products:', data);
    return data;
  },

  async addProduct(formData) {
    const response = await fetch(`${API_BASE_URL}/products/add_product`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
  },

  async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  async fetchUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async editProduct(productId, updatedData) {


    const response = await fetch(`${API_BASE_URL}/products/edit_product/${productId}`, {
      method: 'PUT',
      body: updatedData,
    });

    if (!response.ok) throw new Error('Failed to edit product');
    return response.json();
  },

  // Machinery endpoints
  async fetchMachinery() {
    const response = await fetch(`${API_BASE_URL}/machines/get_all_machines`);
    if (!response.ok) throw new Error('Failed to fetch machinery');
    const data = await response.json();
    console.log('Fetching machinery data', data);
    return data;
  },

  async addMachinery(formData) {
    const response = await fetch(`${API_BASE_URL}/machines/add_machine`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add machinery');
    return response.json();
  },

  async deleteMachinery(machineId) {
    const response = await fetch(`${API_BASE_URL}/machines/delete_machine/${machineId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete machinery');
    return response.json();
  },

  async editMachinery(updatedData) {
    // Extract machine_id from FormData
    const machineId = updatedData.get('machine_id');
    
    // Remove machine_id from FormData since backend expects it as a query parameter
    const formDataToSend = new FormData();
    for (let [key, value] of updatedData.entries()) {
      if (key !== 'machine_id') {
        formDataToSend.append(key, value);
      }
    }

    const response = await fetch(`${API_BASE_URL}/machines/update_machine?machine_id=${machineId}`, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) throw new Error('Failed to edit machinery');
    return response.json();
  },

  // Embroidery Machines endpoints
  async fetchEmbroideryMachines() {
    const response = await fetch(`${API_BASE_URL}/embriodery_machines/get_machines`);
    if (!response.ok) throw new Error('Failed to fetch embroidery machines');
    const data = await response.json();
    console.log('Fetching embroidery machines data', data);
    return data;
  },

  async addEmbroideryMachine(formData) {
    const response = await fetch(`${API_BASE_URL}/embriodery_machines/add_machine`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add embroidery machine');
    return response.json();
  },

  async deleteEmbroideryMachine(machineId) {
    const response = await fetch(`${API_BASE_URL}/embriodery_machines/delete_machine/${machineId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete embroidery machine');
    return response.json();
  },

  async editEmbroideryMachine(machineId, formData) {
    const response = await fetch(`${API_BASE_URL}/embriodery_machines/update_machine/${machineId}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to edit embroidery machine');
    return response.json();
  },
};
