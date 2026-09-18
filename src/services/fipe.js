export async function getFipePrice() {
  try {

    const response = await fetch(
      "https://parallelum.com.br/fipe/api/v1/carros/marcas/22/modelos/5940/anos/2024-1"
    );

    const data = await response.json();

    return data;

  } catch (error) {

    console.log("Erro FIPE:", error);

    return null;
  }
}