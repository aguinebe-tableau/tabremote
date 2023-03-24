import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import { Box, TextField, Button, Stack } from "@mui/material";

import io from "Socket.IO-client";
import { useState, useRef, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [receivedList, setReceivedList] = useState([]);
  const [viz, setViz] = useState(null);
  const [txtBox, setTxtBox] = useState(
    "http://public.tableau.com/views/RegionalSampleWorkbook/Obesity"
  );
  const [vizUrl, setVizUrl] = useState(null);

  const socketInitializer = async () => {
    await fetch("/api/listen");
    const socket = io();

    socket.on("connect", () => {
      console.log("connected");
    });

    //
    // SITUATION COMING IN
    //

    socket.on("tabremote", (data) => {
      var enc = new TextDecoder("utf-8");
      const json = enc.decode(data);

      try {
        const obj = JSON.parse(json);
        setReceivedList((existingList) => existingList.concat([obj]));
      } catch (e) {
        console.log(e);
      }
    });
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  const handleLoad = () => {
    if (viz == null) {
      var divElement = document.getElementById("vizContainer");
      const url = vizUrl;
      const options = {
        hideTabs: true
      };
      var newviz = new window.tableau.Viz(divElement, url);
      setViz(newviz);
    }
  };

  const setParam = () => {
    // var divElement = document.getElementById("viz1665498371417");
  };

  const setFilter = async (obj) => {
    console.log(obj);

    var sheet = viz.getWorkbook().getActiveSheet();

    if (!sheet.getName() == obj.worksheet)
      sheet = sheet.getWorksheets().get(obj.worksheet);

    if (obj.value === "" || !obj.value) {
      console.log("Clearing filter " + obj.name);
      await sheet.clearFilterAsync(obj.name);
    } else {
      console.log("Setting filter " + obj.name + " to " + obj.value);
      await sheet.applyFilterAsync(
        obj.name,
        obj.value,
        tableau.FilterUpdateType.REPLACE
      );
    }
  };

  const setParameter = async (obj) => {
    console.log(obj);

    var workbook = viz.getWorkbook();
    console.log("Setting parameter " + obj.name + " to " + obj.value);
    await workbook.changeParameterValueAsync(obj.name, obj.value);
  };

  useEffect(() => {
    if (receivedList.length > 0) {
      const toprocess = receivedList[0];
      if (toprocess.action == "filter") {
        setFilter(toprocess);
      } else if (toprocess.action == "parameter") {
        setParameter(toprocess);
      }
      setReceivedList((existingList) => existingList.slice(1));
    }
  }, [receivedList]);

  useEffect(() => {
    if (vizUrl) {
      handleLoad();
    }
  }, [vizUrl]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Remote control" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://public.tableau.com/javascripts/api/tableau-2.min.js" />
      </Head>
      <main className={styles.main}>
        <Stack direction="column">
          <Box>Controlled</Box>
          {!vizUrl ? (
            <>
              <TextField
                onChange={(event) => {
                  setTxtBox(event.currentTarget.value);
                }}
                value={txtBox}
              >
                {txtBox}
              </TextField>
              <Button onClick={() => setVizUrl(txtBox)}>Load</Button>
            </>
          ) : (
            <></>
          )}
          <Box>
            <>
              <div
                className="tableauPlaceholder"
                id="vizContainer"
                style={{ position: "relative" }}
              ></div>
            </>
          </Box>
        </Stack>
      </main>
    </>
  );
}
