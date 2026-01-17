
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

def kill_zombies():
    print(f"Connecting to {SERVER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(SERVER, username=USER, password=PASSWORD)
        
        # Check ports 3008 and 3009
        print("\nChecking ports 3008 and 3009...")
        stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep -E '3008|3009'")
        output = stdout.read().decode()
        print(output)
        
        if not output:
            print("No processes found on 3008/3009 (Clean slate?)")
        
        # Kill all node processes to be safe
        print("\nKilling ALL node processes (force update)...")
        # ssh.exec_command("killall -9 node")  # Too aggressive? might kill pm2 daemon
        
        # Better: Restart PM2 and then kill anything still lingering on ports
        print("Restarting PM2 process...")
        ssh.exec_command("pm2 restart cocolu-dashoffice")
        time.sleep(5)
        
        print("Checking ports again...")
        stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep -E '3008|3009'")
        new_output = stdout.read().decode()
        print(new_output)
        
        # Check if logs now show 3009 startup
        print("Checking logs for Port 3009 startup message...")
        stdin, stdout, stderr = ssh.exec_command("tail -n 100 /root/.pm2/logs/cocolu-dashoffice-out.log")
        logs = stdout.read().decode('utf-8', errors='replace')
        if "iniciada en puerto 3009" in logs:
            print("SUCCESS: Port 3009 startup confirmed!")
        else:
            print("WARNING: Port 3009 startup log MISSING. Proceeding to nuclear option.")
            # Nuclear option: Kill any process using 3008/3009 manually
            print("Killing process on 3009...")
            ssh.exec_command("fuser -k -9 3009/tcp")
            print("Killing process on 3008...")
            ssh.exec_command("fuser -k -9 3008/tcp")
            time.sleep(2)
            print("Starting PM2...")
            ssh.exec_command("pm2 start ecosystem.config.cjs")
            
            # Check one last time
            print("Final port check...")
            stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep -E '3008|3009'")
            print(stdout.read().decode())

    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    kill_zombies()
