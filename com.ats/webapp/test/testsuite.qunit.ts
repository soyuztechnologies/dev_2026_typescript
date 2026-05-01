import type {SuiteConfiguration} from "sap/ui/test/starter/config";
export default {
	name: "QUnit test suite for the UI5 Application: com.ats",
	defaults: {
		page: "ui5://test-resources/com/ats/Test.qunit.html?testsuite={suite}&test={name}",
		qunit: {
			version: 2
		},
		sinon: {
			version: 4
		},
		ui5: {
			language: "EN",
			theme: "sap_horizon"
		},
		coverage: {
			only: ["com/ats/"],
			never: ["test-resources/com/ats/"]
		},
		loader: {
			paths: {
				"com/ats": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for com.ats"
		},
		"integration/opaTests": {
			title: "Integration tests for com.ats"
		}
	}
} satisfies SuiteConfiguration;