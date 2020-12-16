# Certificates Manager

> Manage SSL certificates in ABT Node.

## Install on my ABT Node

[![Install on my ABT Node](https://raw.githubusercontent.com/blocklet/development-guide/main/assets/install_on_abtnode.svg)](https://install.arcblock.io/?action=blocklet-install&meta_url=https%3A%2F%2Fgithub.com%2Fblocklet%2Fcertificates-manager%2Freleases%2Fdownload%2F0.1.8%2Fblocklet.json)

## Usage

Certificates can be generated in two ways: manually by adding a domain name, or automatically when a site is added to the Service Gateway of an ABT Node (to be completed).

### Manually adding domain names

_Manually adding a domain name requires the domain name to be properly serve in the ABT Node, otherwise it will not pass the DNS validation and `http-01` challenge._

1. Go to the Certificate Manager Block Administration page
1. Click the `Add Domain` button
1. Enter the domain name to be added
1. If the domain name resolution is normal, the certificate will be generated successfully and updated to ABT Node in a minute or so.

If the domain name is still resolved, or has not been added to Service Gateway for ABT Node, the application checks every `5 minutes` to see if the domain name is being resolved correctly.

Translated with www.DeepL.com/Translator (free version)

### Automatic Certificate Generation

TODO

## Automatic update mechanism

1. the application will try to renew the certificate `10 days` before it expires.
1. the application will check for expiring certificates every `5 minutes`.

## Development

### Configuration

Put following contents in `.env`:

```ini
SKIP_PREFLIGHT_CHECK=true

# server side
BLOCKLET_PORT="3030"

REACT_APP_BASE_URL="http://192.168.31.60:3030"
REACT_APP_APP_NAME="Certificate Manager"
REACT_APP_APP_DESCRIPTION="Manage SSL certificates"
REACT_APP_API_PREFIX=""

ALI_ACCESS_KEY_ID='xxx'
ALI_ACCESS_KEY_SECRET='xxx'
NODE_ACCESS_KEY='xxx'
NODE_ACCESS_SECRET='xxx'
ABT_NODE_PORT=8089
```

### Start hacking

```shell
npm run start:server
npm run start:client
```

### Deploy to local ABT Node

```shell
abtnode deploy .
```
