import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
};

type PokemonListItem = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  results: PokemonListItem[];
};

export default function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState(0);

  async function fetchOnePokemon() {
    if (pokemonName.trim() === '') {
      return;
    }

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.trim().toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: Pokemon = await response.json();
      setPokemon(data);
    } catch (error) {
      console.error('Could not load pokemon:', error);
    }
  }

  async function fetchPokemonList() {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: PokemonListResponse = await response.json();
      setPokemonList(data.results);
      setOffset(offset + 20);
    } catch (error) {
      console.error('Could not load pokemon list:', error);
    }
  }

  function clearOnePokemon() {
    setPokemon(null);
    setPokemonName('');
  }

  function clearPokemonList() {
    setPokemonList([]);
    setOffset(0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokédex</Text>
        <Text style={styles.headerSubtitle}>Powered by PokéAPI</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>SEARCH</Text>
        <TextInput
          style={styles.input}
          placeholder="Name or number (e.g. pikachu)"
          placeholderTextColor="#98A2B3"
          value={pokemonName}
          onChangeText={setPokemonName}
          autoCapitalize="none"
        />
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={fetchOnePokemon}
        >
          <Text style={styles.primaryButtonText}>Search</Text>
        </Pressable>

        {pokemon && (
          <View style={styles.resultCard}>
            <Image
              source={{ uri: pokemon.sprites.front_default }}
              style={styles.image}
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultId}>
                #{String(pokemon.id).padStart(3, '0')}
              </Text>
              <Text style={styles.resultName}>{pokemon.name}</Text>
              <Text style={styles.resultStat}>
                Height: {(pokemon.height / 10).toFixed(1)} m
              </Text>
              <Text style={styles.resultStat}>
                Weight: {(pokemon.weight / 10).toFixed(1)} kg
              </Text>
              <Pressable onPress={clearOnePokemon}>
                <Text style={styles.linkText}>Clear result</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>BROWSE</Text>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={fetchPokemonList}
        >
          <Text style={styles.secondaryButtonText}>
            {offset === 0 ? 'Load 20 Pokémon' : 'Load Next 20'}
          </Text>
        </Pressable>

        {pokemonList.length > 0 && (
          <View style={styles.listHeader}>
            <Text style={styles.rangeText}>
              Showing #{offset - 19} to #{offset}
            </Text>
            <Pressable onPress={clearPokemonList}>
              <Text style={styles.linkText}>Clear list</Text>
            </Pressable>
          </View>
        )}
      </View>

      <FlatList
        data={pokemonList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const id = offset - 20 + index + 1;

          return (
            <View style={styles.row}>
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                }}
                style={styles.rowImage}
              />
              <Text style={styles.rowNumber}>
                #{String(id).padStart(3, '0')}
              </Text>
              <Text style={styles.rowName}>{item.name}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const ACCENT = '#C62828';
const TEXT = '#101828';
const MUTED = '#667085';
const BORDER = '#E4E7EC';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: ACCENT,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#FFD9D9',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  image: {
    width: 96,
    height: 96,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 14,
  },
  resultId: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
  resultName: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  resultStat: {
    color: TEXT,
    fontSize: 14,
    marginTop: 1,
  },
  linkText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  rangeText: {
    color: MUTED,
    fontSize: 13,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  rowImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
  },
  rowNumber: {
    width: 56,
    color: MUTED,
    fontSize: 14,
  },
  rowName: {
    color: TEXT,
    fontSize: 16,
    textTransform: 'capitalize',
  },
});