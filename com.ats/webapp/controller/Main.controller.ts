import MessageBox from "sap/m/MessageBox";
import BaseController from "./BaseController";
import Button from "sap/m/Button";
import JSONModel from "sap/ui/model/json/JSONModel";
import { InputBase$ChangeEvent } from "sap/m/InputBase";
import * as Nominatim from "nominatim-client";


type WeatherInfo = {
	current_weather: {
		temperature: number,
		windspeed: number,
		winddirection: number
	},
	placeName: string
}
/**
 * @namespace com.ats.controller
 */
export default class Main extends BaseController {
	public sayHello(): void {
		MessageBox.show("Hello World!");
	}
	onInit(): void | undefined {
		const oModel = new JSONModel();
		this.setModel(oModel);

		void this.loadWeatherData();
		
	}
	async loadWeatherData(lat = "49.31", lon = "8.64", displayName: string = "Unknown location") { // default coordinates: Walldorf
		const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
		const jsonData = await response.json() as WeatherInfo;
		// this.getModel().setData(jsonData);
		jsonData.placeName = displayName;
		(this.getModel() as JSONModel).setData(jsonData);

	}

	////
	///npm install ui5-tooling-modules --save-dev
	///npm install nominatim-client --save-dev

	locationChange(evt: InputBase$ChangeEvent	) {
		const location = evt.getParameters().value;
		Nominatim.createClient({
			useragent: "Anubhav App", // useragent and referrer required by the terms of use
			referer: "https://localhost"
		}).search({q: location}).then((results) => {
			if (results.length > 0) {
				return this.loadWeatherData(results[0].lat, results[0].lon, results[0].display_name); // for simplicity just use the first/best match
			} else {
				MessageBox.alert(`Location ${location} not found`, {
					actions: MessageBox.Action.CLOSE // enums are now properties on the default export!
				});
			}
		}).catch(() => {
			MessageBox.alert(`Failure while searching ${location}`, {
				actions: MessageBox.Action.CLOSE // enums are now properties on the default export!
			});
		});
	}
	
	public onLoad(): void {
		const oBtn = this.getView().byId("helloButton") as Button;
		oBtn.setText("Hello World");

		//(this.getView().byId("helloButton") as Button).setText("Hello World");
	}
}
