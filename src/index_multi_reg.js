const cron = require("node-cron"); // Instancio el paquete 'node-cron' 
const express = require("express"); // Instancio el paquete 'express'

// Creo una variable llamada 'app' y en ella coloco el método express(); del paquete 'express' 
const app = express();
import 'dotenv/config';
import puppeteer from 'puppeteer';
import { white } from 'chalk';
import { getDay, format } from 'date-fns';
import { schedule } from '../schedule';
import { clearInput, isEmpty, getParams } from './helpers';
// En el campo segundo coloc '*/5' para ejecutar una tarea en consola cada 5 segundos 

if (isEmpty(process.env.ALTAI_USER) || isEmpty(process.env.ALTAI_PASSWORD) || isEmpty(process.env.ALTAI_URL)) {
  console.log(white.bgRed('Error: Enviorment variables missing'));
  process.exit();
}

const params = process.argv;
const date = getParams(params);
const weekDay = getDay(date);
const formattedDate = format(date, 'DD/MM/YYYY');

// Ejecutamos cada minuto de lunes a viernes
cron.schedule("*/1 * 1-5 * *", function () {

  // Formateamos y Mostramos la Fecha Actual 
  function mostrarFecha(verFecha) {

    let hora, minuto;

    hora = verFecha.getHours();
    minuto = verFecha.getMinutes();

    hora = hora
      .toString()
      .padStart(2, '0');

    minuto = minuto
      .toString()
      .padStart(2, '0');

    console.log(`Hora actual : ${hora}:${minuto}`);

    return `${hora}:${minuto}`;
  }

  const resultado = mostrarFecha(new Date());

  if (resultado === "15:30") {
    (async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      try {
        await page.goto(process.env.ALTAI_URL);
        await page.type('#txLoginUsuario', process.env.ALTAI_USER);
        await page.type('#txLoginContrasena', process.env.ALTAI_PASSWORD);
        await page.click('#btnLogin');
        await page.waitFor(500);
        // Check if the login went succesfull
        if ((await page.$('.navbar-brand')) === null) {
          throw new Error('User or Password incorrect');
        }
        await page.waitForSelector('#cpContenidoCentral_lnkbtnNuevoRegistro');
        await page.click('#cpContenidoCentral_lnkbtnNuevoRegistro');
        await page.waitForNavigation();
        await page.waitForSelector('#cpContenidoCentral_loIncFichaActividad_cmbActividad');
        await page.select('#cpContenidoCentral_loIncFichaActividad_cmbActividad', '33584');
        await page.evaluate(
          formattedDate =>
            (document.querySelector('#cpContenidoCentral_loIncFichaActividad_txFechaInicio').value = formattedDate),
          formattedDate
        );
        await clearInput(page, '#cpContenidoCentral_loIncFichaActividad_txHoraInicio');
        await page.type('#cpContenidoCentral_loIncFichaActividad_txHoraInicio', schedule[weekDay].from);
        await page.evaluate(
          formattedDate =>
            (document.querySelector('#cpContenidoCentral_loIncFichaActividad_txFechaFin').value = formattedDate),
          formattedDate
        );

        await clearInput(page, '#cpContenidoCentral_loIncFichaActividad_txHoraFin');
        await page.type('#cpContenidoCentral_loIncFichaActividad_txHoraFin', schedule[weekDay].to);
        await page.type('#cpContenidoCentral_loIncFichaActividad_txDescripcion', ' ');
        await page.click('#cpContenidoCentral_loIncFichaActividad_btnGrabar');
        await page.waitFor('.profile-usertitle-job');
        const hasError = await page.$('#ui_notifIt');
        if (hasError !== null) {
          const error = await hasError.$eval('div.dvAvisoCuerpoCenter', el => el.textContent);
          throw new Error(error);
        }
        console.log('done!');
      } catch (e) {
        console.error(e);
      } finally {
        await browser.close();
      }
    })();
  }

});
// Ejecutamos la aplicación en el puerto 3000
app.listen(3000);

