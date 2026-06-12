import Controller from "sap/ui/core/mvc/Controller";
import * as formatter from "../util/formatter";

/**
 * @namespace com.ats.manageorder.controller
 */
export default class BaseController extends Controller {
    // exposed to every child controller and to the XML views
    public formatter = formatter;

    // common methods for all controllers go here
}