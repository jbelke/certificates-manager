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

- [ ] 在 Reminder 添加更详细的解释
- [x] 更详细的生成证书状态信息
- [ ] 可以使用 websocket 监听添加证书事件 [次高优先级]
- [x] 只更新将要过期的证书，以防更新频率过高 [高优先级]
- [x] 证书维护者，订阅者邮箱 [高优先级]
- [x] save account [高优先级]
- [ ] 轮训生成证书失败队列 [次高优先级]
- [ ] Let's Encrypt 的速率限制和提醒
- [ ] renewal
- [ ] revoke
- [ ] cron
- [ ] ip.abtnet.io 
- [x] better http-01 memory plugin
- [ ] 检查项目中的 TODO/FIXME
- [ ] DNS(CNAME) configuration checking
- [x] Domain List
- [ ] 可以在界面上展示 well-known 地址
