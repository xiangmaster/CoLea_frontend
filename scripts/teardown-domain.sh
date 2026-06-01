#!/usr/bin/env bash
#
# 撤销 setup-domain.sh 做的事：停 caddy + 清 /etc/hosts。

set -euo pipefail

echo "==> 停止 Caddy"
if pgrep -x caddy >/dev/null 2>&1; then
	sudo caddy stop 2>/dev/null || sudo pkill -x caddy || true
	echo "    已停止"
else
	echo "    未运行，跳过"
fi

echo "==> 清理 /etc/hosts"
if grep -q "# colea-demo" /etc/hosts 2>/dev/null; then
	sudo sed -i '' '/# colea-demo/d' /etc/hosts
	echo "    已清理"
else
	echo "    无映射，跳过"
fi

echo "==> 完成"
