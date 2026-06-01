#!/usr/bin/env bash
#
# 把 colea.edu.cn 映射到本地，并可选启动 Caddy 反向代理。
# 这样浏览器地址栏会显示 http://colea.edu.cn / http://doc.colea.edu.cn
# 看起来就像部署过的。
#
# 用法：
#   bash scripts/setup-domain.sh         # 只改 hosts（Tier 1）
#   bash scripts/setup-domain.sh --caddy # 改 hosts + 装/启动 caddy（Tier 2）
#
# 撤销：bash scripts/teardown-domain.sh

set -euo pipefail

DOMAIN=colea.edu.cn
DOC_DOMAIN=doc.colea.edu.cn
HOSTS_MARKER="# colea-demo"
HOSTS_LINE="127.0.0.1 ${DOMAIN} ${DOC_DOMAIN} ${HOSTS_MARKER}"

echo "==> [1/3] 检查 /etc/hosts"
if grep -q "${HOSTS_MARKER}" /etc/hosts 2>/dev/null; then
	echo "    已存在映射，跳过"
else
	echo "    需要写入 /etc/hosts，sudo 权限会被询问一次"
	echo "${HOSTS_LINE}" | sudo tee -a /etc/hosts >/dev/null
	echo "    已写入：${HOSTS_LINE}"
fi

echo "==> [2/3] 验证 DNS"
if ! ping -c 1 -t 1 "${DOMAIN}" >/dev/null 2>&1; then
	echo "    ⚠️ ping ${DOMAIN} 失败，可能 DNS 缓存还没刷新；继续"
fi

if [[ "${1:-}" != "--caddy" ]]; then
	cat <<EOF

==> 完成（Tier 1）

直接访问：
  http://${DOMAIN}:5173    (主应用)
  http://${DOC_DOMAIN}:5173 -> 不通，OnlyOffice 仍走 http://localhost:8080

如果你要去掉端口号，让地址栏更干净，再跑：
  bash scripts/setup-domain.sh --caddy

EOF
	exit 0
fi

echo "==> [3/3] 配置 Caddy"
if ! command -v caddy >/dev/null 2>&1; then
	echo "    检测到 caddy 未安装；用 Homebrew 安装"
	if ! command -v brew >/dev/null 2>&1; then
		echo "    ❌ 没有 Homebrew，请手动安装 caddy 后再跑：https://caddyserver.com/docs/install"
		exit 1
	fi
	brew install caddy
fi

CADDYFILE="$(cd "$(dirname "$0")/.." && pwd)/Caddyfile"
echo "    使用 Caddyfile: ${CADDYFILE}"

# 检查是否已在跑
if pgrep -x caddy >/dev/null 2>&1; then
	echo "    Caddy 已在跑，先停掉"
	sudo pkill -x caddy || true
	sleep 1
fi

echo "    启动 Caddy（绑定 80 端口需要 sudo）"
sudo caddy start --config "${CADDYFILE}" --adapter caddyfile

cat <<EOF

==> 完成（Tier 2）

主应用：    http://${DOMAIN}
OnlyOffice：http://${DOC_DOMAIN}

记得：
  1. 把 .env.local 里的 VITE_ONLYOFFICE_URL 改成 http://${DOC_DOMAIN}
  2. 重启 Vite (Ctrl+C 然后 npm run dev) 让新 allowedHosts 生效
  3. 浏览器硬刷新

停止：bash scripts/teardown-domain.sh

EOF
