const fetch = require("node-fetch"); // Instancio el paquete 'node-fetch'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const extraerFestivos = async () => {

  const actualDate = new Date();
  const actualYear = actualDate.getFullYear();

  const response = await fetch(`https://api.generadordni.es/v2/holidays/holidays?year=${actualYear}&country=ES&state=MD`);
  const data = await response.json();

  return data;
}