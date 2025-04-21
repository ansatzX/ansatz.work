# obsidian webisite 

## introduction
I am using obsidian to create a website for our project.

Publish notes directly from Obsidian to the internet by this extension: [Obsidian Digital Garden](https://dg-docs.ole.dev/)


I referred to the following resources to create this website:

1. [Obsidian Digital Garden's GitHub discussion](https://github.com/oleeskild/obsidian-digital-garden/discussions/160)

2. [dangehub.github.io](https://github.com/dangehub/dangehub.github.io) 's dockerfile and imporvements


## basic usage

1. first fork this repository, then clone it to your local machine.

2. change basic information in `.env` file and port in `docker-compose.yml` file.

3. write README for your website in `src/site/notes/README.md`

4. commit and push your changes to your forked repository.

5. set extension in obsidian, and publish your notes to the forked repository.

6. run `docker build -f Dockerfile -t obsidian-digital-garden:25-04-21 . `

6. run `docker compose up -d ` to raise the webiste on `localhost:port`

7. use nginx to proxy_pass your webiste to your domain with ssl.


```
  server {
    listen 443 ssl;
    server_name ansatz.work;
    location / {
       proxy_pass http://localhost:8080/;
    }
  }
```