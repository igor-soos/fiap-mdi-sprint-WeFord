import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";

import { useState } from "react";
import { COLORS } from "../../src/styles/colors";
import { useAuth } from "../../src/context/AuthContext";
import { useVehicles } from "../../src/context/VehicleContext";
import { useLoyalty } from "../../src/context/LoyaltyContext";
import { FormMessage } from "../../src/components/AuthForm";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {

  const { user, busy, logout, updatePreferences } = useAuth();
  const { primaryVehicle, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { summary, loading: pointsLoading, error: pointsError } = useLoyalty();
  const [error, setError] = useState('');
  async function changePreference(key, value) {
    setError('');
    try { await updatePreferences({ [key]: value }); }
    catch (e) { setError(e.message || 'Não foi possível salvar a preferência.'); }
  }
  async function signOut() {
    setError('');
    try { await logout(); }
    catch (e) { setError(e.message || 'Não foi possível sair. Tente novamente.'); }
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        paddingBottom: 75,
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 140,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          alignItems: "center",
          marginTop: 20,
        }}
      >
        {/* AVATAR */}
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: COLORS.primary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 36,
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: COLORS.primaryDark,
            marginTop: 15,
          }}
        >
          {user?.name || "Usuário"}
        </Text>

        <Text
          style={{
            color: COLORS.textSecondary,
            marginTop: 5,
          }}
        >
          {pointsLoading ? 'Atualizando nível…' : pointsError ? 'Nível indisponível' : `Nível ${summary.level} · demonstração`}
        </Text>
      </View>

      {/* DADOS */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
          marginTop: 30,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.primaryDark,
            marginBottom: 20,
          }}
        >
          Informações
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={COLORS.primaryDark}
          />

          <Text
            style={{
              marginLeft: 10,
              fontSize: 15,
            }}
          >
            {user?.email || "Não informado"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Ionicons
            name="call-outline"
            size={22}
            color={COLORS.primaryDark}
          />

          <Text
            style={{
              marginLeft: 10,
              fontSize: 15,
            }}
          >
            {user?.phone || "Telefone não informado"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="car-sport-outline"
            size={22}
            color={COLORS.primaryDark}
          />

          <Text
            style={{
              marginLeft: 10,
              fontSize: 15,
            }}
          >
            {vehiclesLoading ? 'Carregando veículo…' : vehiclesError ? 'Veículo indisponível. Tente novamente na área Veículos.' : primaryVehicle
              ? `Ford ${primaryVehicle.model} ${primaryVehicle.modelYear}${primaryVehicle.isDemo ? ' (exemplo)' : ''}`
              : 'Nenhum veículo vinculado'}
          </Text>
        </View>
      </View>

      {/* NOTIFICAÇÕES */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.primaryDark,
            marginBottom: 20,
          }}
        >
          Preferências
        </Text>

        {/* OFERTAS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Ofertas exclusivas
            </Text>

            <Text
              style={{
                color: COLORS.textSecondary,
                marginTop: 4,
              }}
            >
              Preferência por ofertas
            </Text>
          </View>

          <Switch
            value={user?.preferences?.offers ?? true}
            disabled={busy}
            accessibilityLabel="Preferência de ofertas"
            onValueChange={(value) => changePreference("offers", value)}
            trackColor={{
              false: "#ccc",
              true: COLORS.primary,
            }}
          />
        </View>

        {/* REVISÃO */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Revisão programada
            </Text>

            <Text
              style={{
                color: COLORS.textSecondary,
                marginTop: 4,
              }}
            >
              Preferência por lembretes
            </Text>
          </View>

          <Switch
            value={user?.preferences?.reviews ?? true}
            disabled={busy}
            accessibilityLabel="Preferência de revisões"
            onValueChange={(value) => changePreference("reviews", value)}
            trackColor={{
              false: "#ccc",
              true: COLORS.primary,
            }}
          />
        </View>
      </View>

      <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
        Preferências salvas nesta conta. O envio de notificações ainda não está ativo.
      </Text>
      <FormMessage message={error} />
      {/* BOTÃO */}
      <TouchableOpacity       
        onPress={signOut}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        style={{
          backgroundColor: "#D9534F",
          padding: 16,
          borderRadius: 14,
          marginTop: 30,
          alignItems: "center",
          marginBottom: 40,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#fff"
        />

        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 8,
          }}
        >
          {busy ? "Aguarde…" : "Sair da conta"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}