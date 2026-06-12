// capm-s4-mashup/srv/server.ts
import cds from "@sap/cds";
import express from "express";
import path from "path";

cds.on("bootstrap", (app) => {
  // serve the PRE-BUILT UI5 app (plain JS, no live transpile)
  app.use(
    "/manageorder",
    express.static(path.join(__dirname, "../app/manageorder/dist"))
  );
});

export default cds.server;