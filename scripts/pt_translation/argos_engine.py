"""Small, testable adapter around the free local Argos Translate library."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


class ArgosUnavailableError(RuntimeError):
    """Raised when Argos or the required English-to-Portuguese model is absent."""


@dataclass(frozen=True)
class ArgosModelInfo:
    source_code: str
    target_code: str
    source_name: str
    target_name: str
    model_name: str


class ArgosEngine:
    """Translate locally with Argos; no network is used during translation."""

    # Argos package indexes have used both ``pb`` and pt-BR-like identifiers
    # for Brazilian Portuguese. Prefer those models before generic Portuguese.
    TARGET_CODES = ("pb", "pt_BR", "pt-BR", "pt_br", "pt")

    def __init__(self, translator: Callable[[str], str], model: ArgosModelInfo):
        self._translator = translator
        self.model = model

    @property
    def identifier(self) -> str:
        return f"argos:{self.model.source_code}->{self.model.target_code}:{self.model.model_name}"

    def translate(self, text: str) -> str:
        translated = self._translator(text)
        if not isinstance(translated, str) or not translated.strip():
            raise RuntimeError("Argos returned an empty translation")
        return translated

    @classmethod
    def load_installed(cls) -> "ArgosEngine":
        try:
            from argostranslate import translate  # type: ignore
        except ImportError as error:
            raise ArgosUnavailableError(
                "Argos Translate is not installed. Install it with "
                "`python3 -m pip install argostranslate`."
            ) from error

        installed = translate.get_installed_languages()
        source = next((language for language in installed if language.code == "en"), None)
        target = next(
            (
                language
                for code in cls.TARGET_CODES
                for language in installed
                if language.code == code
            ),
            None,
        )
        if source is None or target is None:
            installed_codes = ", ".join(sorted(language.code for language in installed)) or "none"
            raise ArgosUnavailableError(
                "The Argos English-to-Portuguese model is not installed "
                f"(installed language codes: {installed_codes}). Run this script with "
                "`--install-model` while internet access is available."
            )
        try:
            translation = source.get_translation(target)
        except Exception as error:
            raise ArgosUnavailableError(
                f"Argos cannot create the {source.code}->{target.code} translation pair."
            ) from error
        package = getattr(translation, "pkg", None)
        model_name = str(
            getattr(package, "package_version", None)
            or getattr(package, "version", None)
            or getattr(translation, "name", None)
            or "installed"
        )
        return cls(
            translation.translate,
            ArgosModelInfo(source.code, target.code, source.name, target.name, model_name),
        )

    @classmethod
    def install_model(cls) -> "ArgosEngine":
        try:
            from argostranslate import package  # type: ignore
        except ImportError as error:
            raise ArgosUnavailableError(
                "Argos Translate is not installed. Install the Python package first with "
                "`python3 -m pip install argostranslate`."
            ) from error

        package.update_package_index()
        available = package.get_available_packages()
        candidate = next(
            (
                item
                for target_code in cls.TARGET_CODES
                for item in available
                if item.from_code == "en" and item.to_code == target_code
            ),
            None,
        )
        if candidate is None:
            available_pairs = ", ".join(
                sorted(f"{item.from_code}->{item.to_code}" for item in available if item.from_code == "en")
            )
            raise ArgosUnavailableError(
                "The Argos package index has no English-to-Portuguese model. "
                f"Available English pairs: {available_pairs or 'none'}"
            )
        model_path = candidate.download()
        package.install_from_path(model_path)
        return cls.load_installed()
