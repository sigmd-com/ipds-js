#!/bin/bash

# IPDS Batch Processing Examples
# This script demonstrates the batch processing functionality of IPDS.

echo "=== IPDS Batch Processing Examples ==="
echo

echo "1. Create IP List File"
echo "================================"

cat > ip_list.txt << EOF
8.8.8.8
1.1.1.1
192.168.1.1
10.0.0.1
172.16.0.1
127.0.0.1
EOF

echo "ip_list.txt file created:"
cat ip_list.txt
echo

echo "2. Execute Batch Processing"
echo "================================"

echo "Query all information for all IPs:"
npx ipds --file ip_list.txt
echo

echo "3. Batch Process Specific Information Only"
echo "================================"

echo "Query network information only:"
npx ipds --file ip_list.txt --network-only
echo

echo "Query ASN information only:"
npx ipds --file ip_list.txt --asn-only
echo

echo "4. Save Results to Files"
echo "================================"

echo "Saving batch processing results to batch_results.json..."
npx ipds --file ip_list.txt --output batch_results.json
echo "Saved: batch_results.json"
echo

echo "Saving network information only to batch_network.json..."
npx ipds --file ip_list.txt --network-only --output batch_network.json
echo "Saved: batch_network.json"
echo

echo "5. Cleanup"
echo "================================"

echo "Generated files:"
ls -la *.txt *.json 2>/dev/null || echo "No files found."
echo

echo "=== Batch Processing Examples Complete ==="
