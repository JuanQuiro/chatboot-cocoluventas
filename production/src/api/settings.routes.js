import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Usar ruta absoluta desde el directorio actual del proceso
const ENV_PATH = path.join(process.cwd(), '.env');

/**
 * Rutas para gestionar configuración del bot (.env)
 */
export function setupSettingsRoutes(app) {
  // GET /api/settings - Obtener todas las variables de entorno (sin valores sensibles)
  app.get('/api/settings', (req, res) => {
    try {
      if (!fs.existsSync(ENV_PATH)) {
        return res.status(404).json({ error: 'Archivo .env no encontrado' });
      }

      const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
      const envVars = {};
      const sensitiveKeys = ['TOKEN', 'SECRET', 'PASSWORD', 'KEY', 'JWT', 'API_KEY'];

      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');

          // Ocultar valores sensibles
          const isSensitive = sensitiveKeys.some(k => key.includes(k));
          envVars[key] = {
            value: isSensitive ? '***REDACTED***' : value,
            isSensitive,
            original: value
          };
        }
      });

      res.json({
        success: true,
        settings: envVars,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al leer .env:', error);
      res.status(500).json({ error: 'Error al leer configuración' });
    }
  });

  // GET /api/settings/:key - Obtener una variable específica
  app.get('/api/settings/:key', (req, res) => {
    try {
      const { key } = req.params;

      if (!fs.existsSync(ENV_PATH)) {
        return res.status(404).json({ error: 'Archivo .env no encontrado' });
      }

      const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
      const regex = new RegExp(`^${key}=(.*)$`, 'm');
      const match = envContent.match(regex);

      if (!match) {
        return res.status(404).json({ error: `Variable ${key} no encontrada` });
      }

      const sensitiveKeys = ['TOKEN', 'SECRET', 'PASSWORD', 'KEY', 'JWT', 'API_KEY'];
      const isSensitive = sensitiveKeys.some(k => key.includes(k));

      res.json({
        success: true,
        key,
        value: isSensitive ? '***REDACTED***' : match[1],
        isSensitive,
        original: match[1]
      });
    } catch (error) {
      console.error('Error al leer variable:', error);
      res.status(500).json({ error: 'Error al leer variable' });
    }
  });

  // POST /api/settings - Actualizar variables de entorno
  app.post('/api/settings', (req, res) => {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Formato de configuración inválido' });
      }

      // Crear archivo .env si no existe (resiliente)
      if (!fs.existsSync(ENV_PATH)) {
        console.log('⚠️ Archivo .env no existe, creándolo...');
        fs.writeFileSync(ENV_PATH, '', 'utf-8');
      }

      let envContent = fs.readFileSync(ENV_PATH, 'utf-8');

      // Actualizar o agregar cada variable
      Object.entries(settings).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');

        if (regex.test(envContent)) {
          // Actualizar variable existente
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          // Agregar nueva variable
          envContent += `\n${key}=${value}`;
        }
      });

      // Guardar cambios
      fs.writeFileSync(ENV_PATH, envContent, 'utf-8');

      // Recargar variables de entorno para que se reflejen inmediatamente
      dotenv.config({ path: ENV_PATH, override: true });

      console.log('✅ Configuración actualizada y recargada en process.env:', Object.keys(settings));

      res.json({
        success: true,
        message: 'Configuración actualizada correctamente',
        updated: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al actualizar .env:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  });

  // PUT /api/settings/:key - Actualizar una variable específica
  app.put('/api/settings/:key', (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!value) {
        return res.status(400).json({ error: 'Valor requerido' });
      }

      // Crear archivo .env si no existe (resiliente)
      if (!fs.existsSync(ENV_PATH)) {
        console.log('⚠️ Archivo .env no existe, creándolo...');
        fs.writeFileSync(ENV_PATH, '', 'utf-8');
      }

      let envContent = fs.readFileSync(ENV_PATH, 'utf-8');
      const regex = new RegExp(`^${key}=.*$`, 'm');

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }

      fs.writeFileSync(ENV_PATH, envContent, 'utf-8');

      // Recargar variables de entorno para que se reflejen inmediatamente
      dotenv.config({ path: ENV_PATH, override: true });

      console.log(`✅ Variable ${key} actualizada y recargada en process.env`);

      res.json({
        success: true,
        message: `Variable ${key} actualizada correctamente`,
        key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al actualizar variable:', error);
      res.status(500).json({ error: 'Error al actualizar variable' });
    }
  });

  // DELETE /api/settings/:key - Eliminar una variable
  app.delete('/api/settings/:key', (req, res) => {
    try {
      const { key } = req.params;

      if (!fs.existsSync(ENV_PATH)) {
        return res.status(404).json({ error: 'Archivo .env no encontrado' });
      }

      let envContent = fs.readFileSync(ENV_PATH, 'utf-8');
      const regex = new RegExp(`^${key}=.*\n?`, 'm');

      if (!regex.test(envContent)) {
        return res.status(404).json({ error: `Variable ${key} no encontrada` });
      }

      envContent = envContent.replace(regex, '');
      fs.writeFileSync(ENV_PATH, envContent, 'utf-8');

      console.log(`✅ Variable ${key} eliminada`);

      res.json({
        success: true,
        message: `Variable ${key} eliminada correctamente`,
        key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al eliminar variable:', error);
      res.status(500).json({ error: 'Error al eliminar variable' });
    }
  });
}
