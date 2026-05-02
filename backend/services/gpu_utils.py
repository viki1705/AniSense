"""GPU detection and configuration utilities"""

import os
import sys
from typing import Dict, Any, Optional


def detect_cuda_available() -> Dict[str, Any]:
    """
    Detect if NVIDIA CUDA GPU is available

    Returns:
        {
            'available': bool,
            'device': 'cuda' or 'cpu',
            'device_count': int,
            'device_name': str or None,
            'memory_gb': float or None,
            'compute_capability': str or None,
        }
    """
    result = {
        'available': False,
        'device': 'cpu',
        'device_count': 0,
        'device_name': None,
        'memory_gb': None,
        'compute_capability': None,
    }

    try:
        import torch

        # Check if CUDA is available
        if not torch.cuda.is_available():
            return result

        # Get device info
        device_count = torch.cuda.device_count()
        if device_count == 0:
            return result

        # Get default GPU info (GPU 0)
        device_name = torch.cuda.get_device_name(0)
        props = torch.cuda.get_device_properties(0)

        # Convert bytes to GB
        memory_gb = props.total_memory / (1024**3)

        # Get compute capability (e.g., "8.6" for RTX 3050)
        compute_capability = f"{props.major}.{props.minor}"

        result = {
            'available': True,
            'device': 'cuda',
            'device_count': device_count,
            'device_name': device_name,
            'memory_gb': round(memory_gb, 2),
            'compute_capability': compute_capability,
        }

        return result

    except ImportError:
        print("[WARN] PyTorch not installed, using CPU")
        return result
    except Exception as e:
        print(f"[WARN] Error detecting CUDA: {e}, falling back to CPU")
        return result


def get_optimal_device() -> str:
    """
    Get optimal device for PyTorch models

    Priority:
    1. Check FORCE_CPU environment variable
    2. Check DEVICE environment variable
    3. Auto-detect CUDA
    4. Fall back to CPU

    Returns:
        'cuda' or 'cpu'
    """
    # Check force CPU override
    if os.getenv('FORCE_CPU', '').lower() in ('true', '1', 'yes'):
        print("[INFO] FORCE_CPU=1, using CPU")
        return 'cpu'

    # Check explicit device setting
    device_env = os.getenv('DEVICE', 'auto').lower()
    if device_env in ('cuda', 'cpu'):
        print(f"[INFO] DEVICE={device_env}, using {device_env}")
        return device_env

    # Auto-detect CUDA
    if device_env == 'auto':
        gpu_info = detect_cuda_available()
        if gpu_info['available']:
            print(f"[STARTUP] GPU detected: {gpu_info['device_name']} ({gpu_info['memory_gb']}GB)")
            return 'cuda'
        else:
            print("[STARTUP] No GPU detected, using CPU")
            return 'cpu'

    # Default fallback
    return 'cpu'


def get_optimal_batch_size(device: str) -> int:
    """
    Get optimal batch size based on device

    Args:
        device: 'cuda' or 'cpu'

    Returns:
        Optimal batch size for embeddings
    """
    if device == 'cuda':
        # GPU can handle larger batches
        # RTX 3050 has 8GB, can handle 64-128
        # Most consumer GPUs handle 64 safely
        return 64
    else:
        # CPU: smaller batches to avoid memory issues
        return 32


def get_device_info() -> Dict[str, Any]:
    """Get comprehensive device information"""
    gpu_info = detect_cuda_available()
    device = get_optimal_device()
    batch_size = get_optimal_batch_size(device)

    return {
        'device': device,
        'device_name': gpu_info['device_name'] or 'CPU',
        'device_count': gpu_info['device_count'],
        'memory_gb': gpu_info['memory_gb'],
        'compute_capability': gpu_info['compute_capability'],
        'batch_size': batch_size,
        'available': gpu_info['available'],
    }


def can_use_gpu() -> bool:
    """Simple check if GPU is available and enabled"""
    return get_optimal_device() == 'cuda'


def get_torch_device() -> str:
    """Get PyTorch device string"""
    device = get_optimal_device()
    return device
