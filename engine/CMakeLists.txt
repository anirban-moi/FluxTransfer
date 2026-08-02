cmake_minimum_required(VERSION 3.25)

project(
    FluxEngine
    VERSION 1.0.0
    DESCRIPTION "High-performance transfer engine for FluxTransfer"
    LANGUAGES CXX
)

# ---------------------------------------------------------------------------
# C++ Standard
# ---------------------------------------------------------------------------

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# ---------------------------------------------------------------------------
# Build Options
# ---------------------------------------------------------------------------

option(FLUX_BUILD_TESTS "Build engine tests" ON)
option(FLUX_BUILD_BENCHMARKS "Build engine benchmarks" ON)
option(FLUX_BUILD_EXAMPLES "Build engine examples" ON)
option(FLUX_BUILD_APPS "Build engine applications" ON)

# ---------------------------------------------------------------------------
# Subdirectories
# ---------------------------------------------------------------------------

add_subdirectory(src)

if(FLUX_BUILD_TESTS)
    add_subdirectory(tests)
endif()

if(FLUX_BUILD_BENCHMARKS)
    add_subdirectory(benchmarks)
endif()

if(FLUX_BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()

if(FLUX_BUILD_APPS)
    add_subdirectory(apps)
endif()