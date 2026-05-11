#!/bin/bash
echo "=== .next キャッシュを削除して起動 ==="
rm -rf .next
npm run dev
