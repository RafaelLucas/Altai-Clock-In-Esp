export const addZero = (a) => {
  if (a < 10) {
    a = "0" + a;
  }
  return a;
}

// Formateamos y Mostramos la Hora Actual 
export const mostrarHora = (data) => {

  data = new Date()

  let hora, minuto;

  hora = addZero(data.getHours()).toString();;
  minuto = addZero(data.getMinutes()).toString();;

  return `${hora}:${minuto}`;
}