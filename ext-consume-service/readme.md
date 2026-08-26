# Getting Started

cds repl --run PROJECT/
.ql

##

Setup
Create a workspace root, e.g. at cap/samples:

```
mkdir -p cap/samples && cd cap/samples
echo '{"workspaces":["*","*/apis/*"]}' > package.json 
```

Clone individual sample projects, and install dependencies:

```
git clone https://github.com/capire/xtravels
git clone https://github.com/capire/xflights
git clone https://github.com/capire/common
git clone https://github.com/capire/s4
npm install
```

Run

Run the XTravels application with all required services (xflights, s4, ...) mocked automatically:

```
cds watch xtravels
```

Use
Open a second terminal, and run OpenCode or Claude in there (assumed you have that setup and configured):

opencode
Enter a prompt, such as:

Plan a trip to sapphire 27 for Anne Pratt flying from Frankfurt
You should see something like this: 


Late-cut µ services
If you like you can also start the individual services separately in different terminals as shown below – no code or config changes required for that, and also no change to the usage in AI chat clients. 

Run each of the lines below in a separate terminal:

```
cds w xtravels/srv/events
cds w xtravels/srv/hotels
cds w s4
cds w xflights
cds w xtravels
opencode
```


Welcome to your new CAP project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`readme.md` | this getting started guide

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start with your domain model, in a CDS file in `db/`

## Learn More

Learn more at <https://cap.cloud.sap>.
