# Certificates Manager

> Manage certificates in ABT Node.

**WORK IN PROGRESS**

## Getting started

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

## TODO

- [ ] 只更新将要过期的证书，以防更新频率过高 [高优先级]
- [ ] 证书维护者，订阅者邮件 [高优先级]
- [ ] save account [高优先级]
- [ ] renewal
- [ ] revoke
- [ ] cron
- [x] better http-01 memory plugin
- [ ] 检查项目中的 TODO/FIXME
- [ ] DNS(CNAME) configuration checking
- [x] Domain List