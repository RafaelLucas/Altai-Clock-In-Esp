const cron = require("node-cron"); // Instancio el paquete 'node-cron' 
const express = require("express"); // Instancio el paquete 'express'
const app = express();

import 'dotenv/config';
import puppeteer from 'puppeteer';
import { white } from 'chalk';
import { getDay, format } from 'date-fns';
import { schedule } from '../schedule';
import { clearInput, isEmpty, getParams, extraerFestivos, mostrarHora } from './helpers';

if (isEmpty(process.env.ALTAI_USER) || isEmpty(process.env.ALTAI_PASSWORD) || isEmpty(process.env.ALTAI_URL)) {
  console.log(white.bgRed('Error: Enviorment variables missing'));
  process.exit();
}

const params = process.argv;
const date = getParams(params);
const weekDay = getDay(date);
const formattedDate = format(date, 'DD/MM/YYYY');
(async () => {

  var esFestivo = false;

  var festivosJson = await extraerFestivos();
  var diaActual = new Date().toLocaleDateString("en-GB")

  for (let i = 0; i < festivosJson.length; i++) {

    const festiveDate = festivosJson[i];
    var diaFestivo = new Date(festiveDate.date).toLocaleDateString("en-GB");
    var festividad = festiveDate.name;

    if (diaActual === diaFestivo) {
      esFestivo = true;
      break
    }
  }

  console.log(`Iniciando proceso...`);

  // Ejecutamos cada minuto de lunes a viernes
  cron.schedule('*/1 * * * Monday,Tuesday,Wednesday,Thursday,Friday', async function () {

    if (!esFestivo) {

      var horaActual = mostrarHora(new Date());

      console.log(`Hora actual : ${horaActual}`);

      switch (horaActual) {

        /** FICHAMOS LA ENTRADA  schedule[weekDay].from **/
        case schedule[weekDay].from:
          console.log('Realizando fichaje...');
          try {
            /** HACEMOS LOGIN **/
            var browser = await puppeteer.launch({ headless: true });
            var page = await browser.newPage();
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

            console.log('Fichaje de entrada realizado correctamente! a las ' + horaActual);
          } catch (e) {
            console.error(e);
          } finally {
            await browser.close();
          }
          break;

        /** FICHAMOS LA SALIDA **/
        case schedule[weekDay].to:
          console.log('Realizando fichaje...');
          /** HACEMOS LOGIN **/
          var browser = await puppeteer.launch({ headless: true });
          var page = await browser.newPage();
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

            console.log('Fichaje de Salida realizado correctamente! a las ' + horaActual);
          } catch (e) {
            console.error(e);
          } finally {
            await browser.close();
          }
          break;
        default:
          break;
      }
    } else {
      console.log('Hoy es ' + festividad + ", " + diaFestivo + ", " + mostrarHora(new Date()));
    }
  });
})();

// Ejecutamos la aplicación en el puerto 3000
app.listen(3000);