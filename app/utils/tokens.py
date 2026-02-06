import tiktoken


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens for OpenAI models using tiktoken."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def truncate_text(text: str, max_tokens: int, model: str = "gpt-4o") -> str:
    """Truncate text to fit within a token budget."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")

    tokens = encoding.encode(text)
    if len(tokens) <= max_tokens:
        return text

    return encoding.decode(tokens[:max_tokens])
