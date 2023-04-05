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
  const mostrarFecha = (verFecha) => {

    let hora, minuto;

    hora = verFecha.getHours().toString();
    minuto = verFecha.getMinutes().toString();

    console.log(`Hora actual : ${hora}:${minuto}`);

    return `${hora}:${minuto}`;
  }

  var fechaActual = mostrarFecha(new Date());

  (async () => {

    switch (fechaActual) {

      /** FICHAMOS LA ENTRADA **/
      case schedule[weekDay].from:

        /** HACEMOS LOGIN **/
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
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

          /** HACEMOS CLICK EN EL BOTON DE FIN DE JORNADA **/
          await page.click('#cpContenidoCentral_lnkbtnGeneralInicio');

          console.log('Fichaje de entrada realizado correctamente!');
        } catch (e) {
          console.error(e);
        } finally {
          await browser.close();
        }
        break;

      /** FICHAMOS LA SALIDA **/
      case schedule[weekDay].to:

        /** HACEMOS LOGIN **/
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
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

          /** HACEMOS CLICK EN EL BOTON DE INICIO DE JORNADA **/
          await page.click('#cpContenidoCentral_lnkbtnGeneralFin');

          console.log('Fichaje de Salida realizado correctamente!');
        } catch (e) {
          console.error(e);
        } finally {
          await browser.close();
        }
        break;
      default:
        break;
    }
  })();
});

// Ejecutamos la aplicación en el puerto 3000
app.listen(3000);

