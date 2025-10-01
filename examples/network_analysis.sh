#!/bin/bash

# IPDS Network Analysis Examples
# This script demonstrates the network analysis functionality of IPDS.

echo "=== IPDS Network Analysis Examples ==="
echo

echo "1. Private IP Network Analysis"
echo "================================"

echo "Class A Private IP (10.0.0.1):"
npx ipds 10.0.0.1 --network-only
echo

echo "Class B Private IP (172.16.0.1):"
npx ipds 172.16.0.1 --network-only
echo

echo "Class C Private IP (192.168.1.1):"
npx ipds 192.168.1.1 --network-only
echo

echo "2. Public IP Network Analysis"
echo "================================"

echo "Google DNS (8.8.8.8):"
npx ipds 8.8.8.8 --network-only
echo

echo "Cloudflare DNS (1.1.1.1):"
npx ipds 1.1.1.1 --network-only
echo

echo "3. Special IP Address Analysis"
echo "================================"

echo "Loopback Address (127.0.0.1):"
npx ipds 127.0.0.1 --network-only
echo

echo "Link Local Address (169.254.1.1):"
npx ipds 169.254.1.1 --network-only
echo

echo "Multicast Address (224.0.0.1):"
npx ipds 224.0.0.1 --network-only
echo

echo "4. Save Results to JSON File"
echo "================================"

echo "Saving network analysis results to network_analysis.json..."
npx ipds 8.8.8.8 --output network_analysis.json
echo "Saved: network_analysis.json"
echo

echo "=== Network Analysis Examples Complete ==="
