import Head from "next/head";
import Image from "next/image";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";

import { Box, TextField, Button, Stack } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [viz, setViz] = useState(null);
  const [txtBox, setTxtBox] = useState(
    "http://public.tableau.com/views/RegionalSampleWorkbook/Obesity"
  );
  const [vizUrl, setVizUrl] = useState(null);

  const sendEvent = (event) => {
    fetch("/api/send", {
      method: "post",
      body: event
    }).then((res) => {
      console.log("Sent " + event);
    });
  };

  const changedFilter = async (event) => {
    const filterName = event.getFieldName();
    const filter = await event.getFilterAsync();
    const worksheet = filter.getWorksheet();
    const eventtosend = JSON.stringify({
      action: "filter",
      worksheet: worksheet.getName(),
      type: filter.getFilterType(),
      name: filterName,
      value: filter.getAppliedValues().map((v) => v.formattedValue)
    });
    sendEvent(eventtosend);
  };

  const changedParameter = async (event) => {
    const parameterName = event.getParameterName();
    const parameter = await event.getParameterAsync();

    const eventtosend = JSON.stringify({
      action: "parameter",
      type: parameter.getDataType(),
      name: parameterName,
      value: parameter.getCurrentValue().formattedValue
    });
    sendEvent(eventtosend);
  };

  const handleLoad = () => {
    if (viz == null) {
      var divElement = document.getElementById("vizContainer");
      const url = vizUrl;
      const options = {
        hideTabs: true,
        onFirstInteractive: function () {
          alert("Loaded viz");
        }
      };
      // console.log(window.tableau)
      var newviz = new window.tableau.Viz(divElement, url);
      newviz.addEventListener(
        window.tableau.TableauEventName.FILTER_CHANGE,
        changedFilter
      );
      newviz.addEventListener(
        window.tableau.TableauEventName.PARAMETER_VALUE_CHANGE,
        changedParameter
      );

      setViz(newviz);
    }
  };

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
          <Box>Remote</Box>
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
