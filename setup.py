#!/usr/bin/env python3
"""
Setup script for the Project Management System.
This script automates the initial setup process.
"""

import os
import sys
import subprocess
import platform


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version is compatible."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print("❌ Python 3.11 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True


def check_node_version():
    """Check if Node.js is installed."""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} detected")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js is not installed. Please install Node.js 18 or higher.")
    return False


def setup_python_environment():
    """Setup Python virtual environment and install dependencies."""
    if not os.path.exists('venv'):
        print("\n🐍 Creating Python virtual environment...")
        if not run_command('python -m venv venv', 'Creating virtual environment'):
            return False
    
    # Activate virtual environment
    if platform.system() == 'Windows':
        activate_script = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
    else:
        activate_script = 'venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
    
    # Install Python dependencies
    if not run_command(f'{pip_cmd} install -r requirements.txt', 'Installing Python dependencies'):
        return False
    
    return True


def setup_django():
    """Setup Django database and sample data."""
    if platform.system() == 'Windows':
        python_cmd = 'venv\\Scripts\\python'
    else:
        python_cmd = 'venv/bin/python'
    
    # Run Django migrations
    if not run_command(f'{python_cmd} manage.py migrate', 'Running Django migrations'):
        return False
    
    # Setup sample data
    if not run_command(f'{python_cmd} manage.py setup_sample_data', 'Setting up sample data'):
        return False
    
    return True


def setup_frontend():
    """Setup frontend dependencies."""
    if not run_command('npm install', 'Installing Node.js dependencies'):
        return False
    
    return True


def main():
    """Main setup function."""
    print("🚀 Project Management System Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        sys.exit(1)
    
    # Setup Python environment
    if not setup_python_environment():
        print("\n❌ Python environment setup failed")
        sys.exit(1)
    
    # Setup Django
    if not setup_django():
        print("\n❌ Django setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the Django server: npm run django")
    print("2. Start the frontend: npm run dev")
    print("3. Open http://localhost:5173 in your browser")
    print("4. GraphQL playground: http://localhost:8000/graphql/")
    print("5. Django admin: http://localhost:8000/admin/")
    
    print("\n💡 Alternative: Use Docker")
    print("docker-compose up -d")
    print("npm run dev")


if __name__ == '__main__':
    main()
