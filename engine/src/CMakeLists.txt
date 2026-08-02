# ---------------------------------------------------------------------------
# FluxEngine Library
# ---------------------------------------------------------------------------

add_library(FluxEngine)

target_compile_features(FluxEngine PUBLIC cxx_std_20)

target_include_directories(
    FluxEngine
    PUBLIC
        ${PROJECT_SOURCE_DIR}/include
)

target_sources(
    FluxEngine
    PRIVATE
        Engine.cpp
)

add_library(Flux::Engine ALIAS FluxEngine)