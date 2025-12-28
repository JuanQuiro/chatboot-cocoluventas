
import paramiko
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

def main():
    print("Connecting...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    
    try:
        # Upload app-integrated.js
        print("Uploading app-integrated.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'app-integrated.js'), '/var/www/cocolu-chatbot/app-integrated.js')
        
        # Upload patched repository
        print("Uploading seller.repository.js...")
        ssh.exec_command("rm /var/www/cocolu-chatbot/src/repositories/seller.repository.js")
        sftp.put(os.path.join(PROJECT_PATH, 'src/repositories/seller.repository.js'), '/var/www/cocolu-chatbot/src/repositories/seller.repository.js')

        # Upload patched sellers service (CRITICAL FIX)
        print("Uploading sellers.service.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/services/sellers.service.js'), '/var/www/cocolu-chatbot/src/services/sellers.service.js')

        # Upload patched logs service
        print("Uploading logs.service.js...")
        ssh.exec_command("rm /var/www/cocolu-chatbot/src/services/logs.service.js")
        sftp.put(os.path.join(PROJECT_PATH, 'src/services/logs.service.js'), '/var/www/cocolu-chatbot/src/services/logs.service.js')

        # Upload patched BCV service
        print("Uploading bcv.service.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/services/bcv.service.js'), '/var/www/cocolu-chatbot/src/services/bcv.service.js')

        # Upload patched Persistence utility
        print("Uploading persistence.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/utils/persistence.js'), '/var/www/cocolu-chatbot/src/utils/persistence.js')

        # Upload patched Enhanced Routes (Debug)
        print("Uploading enhanced-routes.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/api/enhanced-routes.js'), '/var/www/cocolu-chatbot/src/api/enhanced-routes.js')

        # Upload patched Catalog Service
        print("Uploading catalogo-completo.service.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/services/catalogo-completo.service.js'), '/var/www/cocolu-chatbot/src/services/catalogo-completo.service.js')
        
        # Upload patched API routes (Debug)
        print("Uploading routes.js...")
        sftp.put(os.path.join(PROJECT_PATH, 'src/api/routes.js'), '/var/www/cocolu-chatbot/src/api/routes.js')

        # Upload data files (ensure they are not empty)
        data_files = ['analytics-state.json', 'sellers-state.json', 'logs.json', 'bcv_rate.json', 'cocolu.db']
        for df in data_files:
            local_path = os.path.join(PROJECT_PATH, 'data', df)
            if os.path.exists(local_path):
                print(f"Uploading data/{df}...")
                sftp.put(local_path, f"/var/www/cocolu-chatbot/data/{df}")
            else:
                print(f"Warning: {df} not found locally.")

        print("\nChecking remote data files...")
        stdin, stdout, stderr = ssh.exec_command("ls -l /var/www/cocolu-chatbot/data")
        print(stdout.read().decode())

        print("Restarting Backend...")
        stdin, stdout, stderr = ssh.exec_command("pm2 restart cocolu-dashoffice || pm2 restart ecosystem.config.cjs")

        print(stdout.read().decode())
        print(stderr.read().decode())
        
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        sftp.close()
        ssh.close()

if __name__ == "__main__":
    main()
