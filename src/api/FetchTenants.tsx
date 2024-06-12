export const fetchTenants = async () => {
  try {
    const response = await fetch(
      `/api/facts/${process.env.NEXT_PUBLIC_PROJ_ID}/${process.env.NEXT_PUBLIC_ENV_ID}/tenants`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERMIT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenants");
    }

    const data = await response.json();
    console.log("DATA: ", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
};
