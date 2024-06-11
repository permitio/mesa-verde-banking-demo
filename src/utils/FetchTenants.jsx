import axios from 'axios';

const fetchTenants = async () => {
  const proj_id = 'barclays-planning';
  const env_id = 'filip';
  const url = `https://api.permit.io/v2/facts/${proj_id}/${env_id}/tenants`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
};

export default fetchTenants;
