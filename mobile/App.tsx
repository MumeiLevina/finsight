import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import {
  NavigationContainer,
  useFocusEffect,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { api, money, monthKey } from "./src/api";
import { C } from "./src/theme";
import type { Category, Summary, Transaction, TxType, User } from "./src/types";

const Auth = createContext<any>(null);
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => SecureStore.deleteItemAsync("token"))
      .finally(() => setLoading(false));
  }, []);
  async function submit(path: string, body: object) {
    const r = await api<{ token: string; user: User }>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    await SecureStore.setItemAsync("token", r.token);
    setUser(r.user);
  }
  return (
    <Auth.Provider
      value={{
        user,
        loading,
        login: (email: string, password: string) =>
          submit("/auth/login", { email, password }),
        register: (name: string, email: string, password: string) =>
          submit("/auth/register", { name, email, password }),
        logout: async () => {
          await SecureStore.deleteItemAsync("token");
          setUser(null);
        },
      }}
    >
      {children}
    </Auth.Provider>
  );
}
function Btn({
  title,
  onPress,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        danger && { backgroundColor: C.red },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={s.btnText}>{title}</Text>
    </Pressable>
  );
}
function Field({
  label,
  ...p
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor="#9AA59F" {...p} style={s.input} />
    </View>
  );
}
function Header({ over, title }: { over: string; title: string }) {
  return (
    <View style={{ gap: 3, marginBottom: 10 }}>
      <Text style={s.over}>{over}</Text>
      <Text style={s.title}>{title}</Text>
    </View>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name="receipt-outline" size={30} color={C.muted} />
      <Text style={s.muted}>{text}</Text>
    </View>
  );
}
function AuthScreen() {
  const a = useContext(Auth),
    [register, setRegister] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  async function go() {
    try {
      setError("");
      register
        ? await a.register(name, email, password)
        : await a.login(email, password);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <SafeAreaView style={s.auth}>
      <StatusBar style="dark" />
      <View>
        <Text style={s.brand}>FinSight</Text>
        <Text style={s.hero}>Tiền bạc rõ ràng.{"\n"}Tương lai vững vàng.</Text>
        <Text style={s.lead}>
          Theo dõi chi tiêu và làm chủ ngân sách mỗi tháng.
        </Text>
      </View>
      <View style={{ gap: 13 }}>
        {register && (
          <Field label="Họ và tên" value={name} onChangeText={setName} />
        )}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Tối thiểu 8 ký tự"
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Btn title={register ? "Tạo tài khoản" : "Đăng nhập"} onPress={go} />
        <Pressable onPress={() => setRegister(!register)}>
          <Text style={s.link}>
            {register
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function TxRow({ x, onPress }: { x: Transaction; onPress?: () => void }) {
  const inc = x.type === "INCOME";
  return (
    <Pressable onPress={onPress} style={s.row}>
      <View
        style={[s.icon, { backgroundColor: inc ? C.greenSoft : C.redSoft }]}
      >
        <Ionicons
          name={inc ? "arrow-down" : "arrow-up"}
          size={18}
          color={inc ? C.green : C.red}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{x.category.name}</Text>
        <Text style={s.small}>
          {new Date(x.date).toLocaleDateString("vi-VN") +
            (x.note ? " · " + x.note : "")}
        </Text>
      </View>
      <Text style={[s.amount, { color: inc ? C.green : C.ink }]}>
        {(inc ? "+" : "−") + money(x.amount)}
      </Text>
    </Pressable>
  );
}
function Dashboard() {
  const [data, setData] = useState<Summary>(),
    [error, setError] = useState("");
  async function load() {
    try {
      setData(await api("/dashboard/summary?month=" + monthKey()));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, []),
  );
  if (!data && !error)
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={undefined}
    >
      <Header
        over={"THÁNG " + (new Date().getMonth() + 1)}
        title="Tổng quan tài chính"
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      {data && (
        <>
          <View style={s.balance}>
            <Text style={s.balanceLabel}>SỐ DƯ THÁNG NÀY</Text>
            <Text style={s.balanceValue}>{money(data.netBalance)}</Text>
            <View style={s.metrics}>
              <View>
                <Text style={s.balanceLabel}>THU NHẬP</Text>
                <Text style={s.income}>{money(data.totalIncome)}</Text>
              </View>
              <View>
                <Text style={s.balanceLabel}>CHI TIÊU</Text>
                <Text style={s.expense}>{money(data.totalExpense)}</Text>
              </View>
            </View>
          </View>
          <Text style={s.section}>Ngân sách</Text>
          <View style={s.card}>
            <View style={s.between}>
              <Text style={s.rowTitle}>
                {data.budgetUsage >= 100
                  ? "Đã vượt ngân sách"
                  : data.budgetUsage >= 80
                    ? "Sắp chạm giới hạn"
                    : "Bạn đang kiểm soát tốt"}
              </Text>
              <Text style={s.bold}>{Math.round(data.budgetUsage)}%</Text>
            </View>
            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  {
                    width: (Math.min(100, data.budgetUsage) + "%") as any,
                    backgroundColor: data.budgetUsage >= 90 ? C.red : C.green,
                  },
                ]}
              />
            </View>
            <Text style={s.muted}>
              Còn {money(data.remainingBudget)} trên {money(data.budgetLimit)}
            </Text>
          </View>
          <Text style={s.section}>Giao dịch gần đây</Text>
          {data.recentTransactions.length ? (
            data.recentTransactions.map((x) => <TxRow key={x.id} x={x} />)
          ) : (
            <Empty text="Chưa có giao dịch trong tháng" />
          )}
          <Text style={s.section}>Chi tiêu theo danh mục</Text>
          {data.expenseByCategory.map((x) => (
            <View key={x.category.id} style={s.row}>
              <Text style={[s.rowTitle, { flex: 1 }]}>{x.category.name}</Text>
              <Text style={s.bold}>{money(x.amount)}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
function TxForm({
  visible,
  item,
  onClose,
  onSaved,
}: {
  visible: boolean;
  item?: Transaction;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<TxType>(item?.type || "EXPENSE"),
    [amount, setAmount] = useState(item?.amount || ""),
    [note, setNote] = useState(item?.note || ""),
    [cats, setCats] = useState<Category[]>([]),
    [catId, setCatId] = useState(item?.category.id || ""),
    [error, setError] = useState("");
  useEffect(() => {
    if (visible)
      api<{ categories: Category[] }>("/categories")
        .then((r) => {
          setCats(r.categories);
          setCatId(
            item?.category.id ||
              r.categories.find((c) => c.type === type)?.id ||
              "",
          );
        })
        .catch((e) => setError(e.message));
  }, [visible]);
  useEffect(() => {
    if (cats.length && !cats.some((c) => c.id === catId && c.type === type))
      setCatId(cats.find((c) => c.type === type)?.id || "");
  }, [type]);
  async function save() {
    try {
      if (!/^\d+$/.test(amount) || Number(amount) <= 0)
        throw new Error("Số tiền phải lớn hơn 0");
      await api(item ? "/transactions/" + item.id : "/transactions", {
        method: item ? "PATCH" : "POST",
        body: JSON.stringify({
          type,
          amount,
          categoryId: catId,
          date: item?.date || new Date().toISOString(),
          note,
        }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={s.page}>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.between}>
            <Header over="GIAO DỊCH" title={item ? "Chỉnh sửa" : "Thêm mới"} />
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={28} />
            </Pressable>
          </View>
          <View style={s.segment}>
            {(["EXPENSE", "INCOME"] as TxType[]).map((v) => (
              <Pressable
                key={v}
                onPress={() => setType(v)}
                style={[s.segmentItem, type === v && s.segmentOn]}
              >
                <Text style={type === v ? s.segmentText : s.muted}>
                  {v === "EXPENSE" ? "Chi tiêu" : "Thu nhập"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="Số tiền (VND)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
          />
          <Text style={s.label}>Danh mục</Text>
          <View style={s.chips}>
            {cats
              .filter((c) => c.type === type)
              .map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCatId(c.id)}
                  style={[s.chip, catId === c.id && s.chipOn]}
                >
                  <Text style={catId === c.id ? s.chipText : s.rowTitle}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
          </View>
          <Field
            label="Ghi chú"
            value={note}
            onChangeText={setNote}
            placeholder="Không bắt buộc"
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <Btn title="Lưu giao dịch" onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
function Transactions() {
  const [list, setList] = useState<Transaction[]>([]),
    [filter, setFilter] = useState<"ALL" | TxType>("ALL"),
    [loading, setLoading] = useState(false),
    [modal, setModal] = useState(false),
    [edit, setEdit] = useState<Transaction>();
  async function load() {
    setLoading(true);
    try {
      const q = filter === "ALL" ? "" : "&type=" + filter;
      setList(
        (
          await api<{ transactions: Transaction[] }>(
            "/transactions?month=" + monthKey() + q,
          )
        ).transactions,
      );
    } catch (e) {
      Alert.alert("Có lỗi", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filter]);
  function details(x: Transaction) {
    Alert.alert(
      x.category.name,
      money(x.amount) +
        " · " +
        new Date(x.date).toLocaleDateString("vi-VN") +
        "\n" +
        (x.note || "Không có ghi chú"),
      [
        { text: "Đóng" },
        {
          text: "Sửa",
          onPress: () => {
            setEdit(x);
            setModal(true);
          },
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () =>
            Alert.alert("Xóa giao dịch?", "Dữ liệu không thể khôi phục.", [
              { text: "Hủy" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                  await api("/transactions/" + x.id, { method: "DELETE" });
                  load();
                },
              },
            ]),
        },
      ],
    );
  }
  return (
    <SafeAreaView style={s.page}>
      <View style={s.content}>
        <Header over="THÁNG NÀY" title="Giao dịch" />
        <View style={s.filters}>
          {(
            [
              ["ALL", "Tất cả"],
              ["EXPENSE", "Chi tiêu"],
              ["INCOME", "Thu nhập"],
            ] as const
          ).map(([v, l]) => (
            <Pressable
              key={v}
              onPress={() => setFilter(v)}
              style={[s.filter, filter === v && s.filterOn]}
            >
              <Text style={filter === v ? s.filterText : s.muted}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={C.green} />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(x) => x.id}
            renderItem={({ item }) => (
              <TxRow x={item} onPress={() => details(item)} />
            )}
            ListEmptyComponent={<Empty text="Chưa có giao dịch phù hợp" />}
            onRefresh={load}
            refreshing={loading}
          />
        )}
        <Pressable
          style={s.fab}
          onPress={() => {
            setEdit(undefined);
            setModal(true);
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
        <TxForm
          visible={modal}
          item={edit}
          onClose={() => setModal(false)}
          onSaved={load}
        />
      </View>
    </SafeAreaView>
  );
}
function Budget() {
  const [limit, setLimit] = useState(""),
    [stat, setStat] = useState<any>(),
    [error, setError] = useState("");
  async function load() {
    try {
      const r: any = await api("/budgets?month=" + monthKey());
      setStat(r);
      if (r.budget) setLimit(r.budget.limit);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, []),
  );
  async function save() {
    try {
      await api("/budgets", {
        method: "POST",
        body: JSON.stringify({ month: monthKey(), limit }),
      });
      await load();
      Alert.alert("Đã lưu", "Ngân sách tháng đã được cập nhật.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Header over="KẾ HOẠCH THÁNG" title="Ngân sách" />
      <View style={s.balance}>
        <Text style={s.balanceLabel}>CÒN CÓ THỂ CHI</Text>
        <Text style={s.balanceValue}>{money(stat?.remaining || 0)}</Text>
        <Text style={{ color: "#B9CAC1" }}>
          Đã dùng {Math.round(stat?.usagePercentage || 0)}% ·{" "}
          {money(stat?.spent || 0)}
        </Text>
      </View>
      <View style={s.card}>
        <Field
          label="Hạn mức tháng (VND)"
          value={limit}
          onChangeText={setLimit}
          keyboardType="number-pad"
          placeholder="Ví dụ: 5000000"
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Btn title="Lưu ngân sách" onPress={save} />
      </View>
      <Text style={s.section}>Mốc cảnh báo</Text>
      {[
        ["80%", "Sắp chạm giới hạn"],
        ["90%", "Chi tiêu đang ở mức cao"],
        ["100%", "Đã đạt hoặc vượt ngân sách"],
      ].map((x) => (
        <View style={s.row} key={x[0]}>
          <Text style={s.bold}>{x[0]}</Text>
          <Text style={s.muted}>{x[1]}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
function Account() {
  const a = useContext(Auth);
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Header over="HỒ SƠ" title="Tài khoản" />
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{a.user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={s.title}>{a.user?.name}</Text>
        <Text style={s.muted}>{a.user?.email}</Text>
      </View>
      <Btn
        danger
        title="Đăng xuất"
        onPress={() =>
          Alert.alert(
            "Đăng xuất?",
            "Bạn có thể đăng nhập lại bất cứ lúc nào.",
            [
              { text: "Hủy" },
              { text: "Đăng xuất", style: "destructive", onPress: a.logout },
            ],
          )
        }
      />
    </ScrollView>
  );
}
const Tab = createBottomTabNavigator();
function Main() {
  const icons: any = {
    TongQuan: "pie-chart-outline",
    GiaoDich: "swap-horizontal-outline",
    NganSach: "wallet-outline",
    TaiKhoan: "person-outline",
  };
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.green,
          tabBarInactiveTintColor: C.muted,
          tabBarStyle: {
            height: 68,
            paddingTop: 7,
            paddingBottom: 8,
            borderTopColor: C.line,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={icons[route.name]} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen
          name="TongQuan"
          component={Dashboard}
          options={{ title: "Tổng quan" }}
        />
        <Tab.Screen
          name="GiaoDich"
          component={Transactions}
          options={{ title: "Giao dịch" }}
        />
        <Tab.Screen
          name="NganSach"
          component={Budget}
          options={{ title: "Ngân sách" }}
        />
        <Tab.Screen
          name="TaiKhoan"
          component={Account}
          options={{ title: "Tài khoản" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
function Root() {
  const a = useContext(Auth);
  if (a.loading)
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  return a.user ? <Main /> : <AuthScreen />;
}
export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 100, gap: 14 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
  auth: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: C.bg,
  },
  brand: { fontSize: 18, fontWeight: "800", color: C.green, marginBottom: 28 },
  hero: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.3,
    color: C.ink,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: C.muted,
    marginTop: 14,
    maxWidth: 310,
  },
  label: { fontSize: 13, fontWeight: "700", color: C.ink },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: C.paper,
    color: C.ink,
    fontSize: 16,
  },
  btn: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "white", fontSize: 15, fontWeight: "800" },
  link: { color: C.green, textAlign: "center", fontWeight: "700", padding: 10 },
  error: { color: C.red, fontSize: 13 },
  over: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: C.green },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6, color: C.ink },
  balance: { backgroundColor: C.ink, borderRadius: 18, padding: 22, gap: 10 },
  balanceLabel: {
    color: "#AFC1B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  balanceValue: { color: "white", fontSize: 32, fontWeight: "800" },
  metrics: { flexDirection: "row", gap: 35, marginTop: 10 },
  income: { color: "#75D5AE", fontWeight: "800", fontSize: 16 },
  expense: { color: "#FF9A83", fontWeight: "800", fontSize: 16 },
  section: { fontSize: 18, fontWeight: "800", color: C.ink, marginTop: 12 },
  card: {
    backgroundColor: C.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    gap: 14,
  },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  row: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 15, fontWeight: "700", color: C.ink },
  small: { fontSize: 12, color: C.muted, marginTop: 4 },
  amount: { fontSize: 14, fontWeight: "800", maxWidth: 130 },
  bold: { fontWeight: "800", color: C.ink },
  muted: { color: C.muted, fontSize: 14 },
  track: {
    height: 9,
    borderRadius: 99,
    backgroundColor: C.line,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 99 },
  empty: {
    alignItems: "center",
    gap: 8,
    padding: 34,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.line,
    borderRadius: 16,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: C.line,
    borderRadius: 12,
    padding: 3,
  },
  segmentItem: { flex: 1, padding: 12, alignItems: "center", borderRadius: 10 },
  segmentOn: { backgroundColor: C.ink },
  segmentText: { color: "white", fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 99,
    backgroundColor: C.paper,
  },
  chipOn: { backgroundColor: C.green, borderColor: C.green },
  chipText: { color: "white", fontWeight: "700" },
  filters: { flexDirection: "row", gap: 8 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: C.line,
  },
  filterOn: { backgroundColor: C.ink, borderColor: C.ink },
  filterText: { color: "white", fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  profile: {
    alignItems: "center",
    padding: 28,
    gap: 7,
    backgroundColor: C.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.greenSoft,
  },
  avatarText: { fontSize: 30, fontWeight: "800", color: C.green },
});
