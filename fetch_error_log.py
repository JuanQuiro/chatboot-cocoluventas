
import paramiko
import sys

# Force UTF-8 output for Windows console
sys.stdout.reconfigure(encoding='utf-8')

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

def fetch_logs():
    print(f"Connecting to {SERVER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(SERVER, username=USER, password=PASSWORD)
        
        # Try to find the log file. PM2 usually puts them in ~/.pm2/logs
        # The app name in ecosystem.config.cjs is 'cocolu-backend' or 'cocolu-dashoffice' (need to check)
        # Based on deploy_auto.py, it started 'ecosystem.config.cjs'.
        
        # Let's check PM2 list to see the name or just list the log directory
        stdin, stdout, stderr = ssh.exec_command("ls -F /root/.pm2/logs/")
        logs = stdout.read().decode().split('\n')
        print("Available logs:", logs)
        
        # We likely want 'cocolu-backend-error.log' or similar.
        error_logs = [l for l in logs if 'error' in l and 'cocolu' in l]
        
        if error_logs:
            # We want the output log for 'cocolu-dashoffice'
            target_log = 'cocolu-dashoffice-out.log'
            print(f"Fetching last 200 lines from {target_log}...")
            # Try both root and user pm2 paths
            stdin, stdout, stderr = ssh.exec_command(f"tail -n 200 /root/.pm2/logs/{target_log} 2>/dev/null || tail -n 200 /Users/grana/.pm2/logs/{target_log}")
            print(stdout.read().decode('utf-8', errors='replace'))

        
        # Run Verification

        print("\nVerifying API Health (Port 3008 - Bot)...")
        stdin, stdout, stderr = ssh.exec_command("curl -v http://localhost:3008/api/dashboard")
        print(stdout.read().decode('utf-8', errors='replace'))
        print(stderr.read().decode('utf-8', errors='replace'))

        print("\nVerifying API Health (Port 3009 - API)...")
        stdin, stdout, stderr = ssh.exec_command("curl -v http://localhost:3009/api/dashboard")
        print(stdout.read().decode('utf-8', errors='replace'))
        print(stderr.read().decode('utf-8', errors='replace'))
        print(stderr.read().decode('utf-8', errors='replace'))

            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    fetch_logs()
